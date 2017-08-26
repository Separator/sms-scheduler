var TelegramBot = require( 'node-telegram-bot-api' );
var db = require( "./db" );

var token = db.settings.get().telegram.token;
var chatsList = db.telegram.getAll();
var bot = new TelegramBot( token, { polling: true } );

function sendCommandsList( chatId ) {
    bot.sendMessage( chatId, "Список доступных команд:\r\n" +
        "/phone 77771112233 Идентификация пользователя\r\n" +
        "Например, если Ваш номер телефона +7 777-111-22-33, " +
        "то Вы должны ввести /phone 77771112233\r\n" +
        "/unsubscribe Отписаться от получения сообщений\r\n" +
        "/subscribe Подписаться на получение сообщений\r\n" +
        "/info Получить информацию о списке команд\r\n"
    );
};

function auth( chatId, phone ) {
    var chatInfo = chatsList[ chatId ];
    if ( chatInfo.userId ) {
        bot.sendMessage( chatId, "Вы уже идентифицированы!" );
        return false;
    };
    var users = db.user.getAll();
    for ( var userID in users ) {
        var contacts = users[ userID ].contacts.phone;
        if ( contacts ) {
            for ( var i = 0; i < contacts.length; i++ ) {
                var contact = contacts[ i ][0];
                if ( phone == contact ) {
                    chatInfo.userId = userID;
                    chatInfo.isSubscribed = true;
                    db.telegram.update( chatId, chatInfo );
                    chatsList = db.telegram.getAll();
                    bot.sendMessage( chatId, "Вы успешно идентифицированы!\r\n" +
                        "ФИО: " + users[ userID ].fio );
                    return true;
                };
            };
        };
    };
    bot.sendMessage( chatId, "К сожалению, я не нашёл пользователя с таким номером телефона!" );
};

bot.on( 'message', function ( msg ) {
    var chatId = msg.chat.id;
    if ( msg.from.is_bot ) {
        bot.sendMessage( chatId, 'Access denied' );
        return false;
    };
    if ( ! ( chatId in chatsList ) ) {
        db.telegram.append( chatId, {
            userId: null,
            isSubscribed: false
        } );
        chatsList = db.telegram.getAll();
    };
    var chatInfo = chatsList[ chatId ];
    var command = msg.text;
    switch ( command ) {
        case "/start": {
            if ( chatInfo.userId ) {
                bot.sendMessage( chatId, "Вы уже вошли в чат!" );
            } else {
                bot.sendMessage( chatId, "Добро пожаловать в чат!\r\n" +
                    "Данный чат служит для информирования о необходимости принятия пищи в заданное время\r\n" +
                    "Если вы хотите получать такие уведомления, пожалуйста, пройдите идентификацию\r\n" );
                sendCommandsList( chatId );
            };
            break;
        }
        case "/unsubscribe": {
            chatInfo.isSubscribed = false;
            db.telegram.update( chatId, chatInfo );
            chatsList = db.telegram.getAll();
            bot.sendMessage( chatId, "Вы успешно отписались от отправки уведомлений!" );
            break;
        }
        case "/subscribe": {
            chatInfo.isSubscribed = true;
            db.telegram.update( chatId, chatInfo );
            chatsList = db.telegram.getAll();
            bot.sendMessage( chatId, "Вы успешно подписались на отправку уведомлений!" );
            break;
        }
        case "/info": {
            sendCommandsList( chatId );
            break;
        }
        default: {
            if ( command ) {
                if ( command.slice( 0, 6 ) == "/phone" ) {
                    auth( chatId, command.split( " " )[1] );
                } else {
                    bot.sendMessage( chatId, "Не знаю такой команды!" );
                    sendCommandsList( chatId );
                };
            };
        }
    };
    if ( msg.contact ) {
        auth( chatId, msg.contact.phone_number );
    };
} );

module.exports = {
    send: function( userId, message ) {
        for ( var chatId in chatsList ) {
            var chatInfo = chatsList[ chatId ];
            if ( chatInfo.userId == userId ) {
                bot.sendMessage( chatId, message );
                return true;
            };
        };
        return false;
    }
};
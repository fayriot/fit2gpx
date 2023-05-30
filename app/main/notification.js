const { Notification } = require( 'electron' );

exports.send = (title, body) => {
    const message = new Notification( {
        title: title,
        body: body
    } );

    message.show();
};

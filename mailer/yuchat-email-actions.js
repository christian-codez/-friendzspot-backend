const nodemailer = require('nodemailer');
const config = require('config');
const { testV } = require('../helpers/manage-tokens');

exports.sendmail = async user => {
  const host = process.env.frontendurl || config.get('url');
  const token = generateToken(user);
  let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'tech.nwachukwu16@gmail.com',
      pass: process.env.emailpass || "1ts's@fe100%",
    },
  });
  let url = host + '/account-verification/' + token;
  // send mail with defined transport object
  let info = await transporter.sendMail({
    from: '"Yuchat Messenger" <yuchat.herokuapp.com>', // sender address
    to: user.email, // list of receivers
    subject: 'Account verification', // Subject line
    text: `Click on the following url to verify your account ${url}`, // plain text body
    html: `
            <h1>Welcome to Yuchat Messenger!</h1>
            <hr/>
            <h2>We need to verify your account</h2>
            <p>Hey ${user.firstname}, you are almost ready to start enjoying Yuchat. Simply click the big yellow button below to verify your email address.</p>
            <a style='
            background-color: #c39900;
            padding: 9px 29px;
            color: #fff;
            text-decoration: none;
            display: inline-block;
            font-size: 20px;
            margin: 25px 0;'
            href='${url}'>Verify email address</a>
            <p>If you have any problem please paste the URL in your web browser</p>
            <p>Thanks,</p>
            <p>Yuchat Support</p>
    `,
  });
  console.log('Message sent: %s', info.messageId);
};

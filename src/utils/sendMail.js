const mail = require("@sendgrid/mail");

mail.setApiKey(process.env.SENDGRID_KEY);

exports.sendMail = async (to, subject, msg) => {
  mail
    .send({
      from: "akshat.sabharwal.work@gmail.com",
      to: "akshatsabharwal35@gmail.com",
      subject: subject,
      text: msg,
      html: "<strong>Hello World</strong>",
    })
    // .then(async (val) => {
    //   val = val[0];
    //   val = await val.json();

    //   return val;
    // })
    .then((val) => console.log(val));
};

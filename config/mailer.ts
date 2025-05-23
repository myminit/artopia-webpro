import nodemailer from 'nodemailer';

export async function sendEmail({ to, subject, text, html }: {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}) {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.HOST,
      service: process.env.SERVICE,
      port: Number(process.env.PORT),
      secure: Boolean(process.env.SECURE),
      auth: {
        user: process.env.USER,
        pass: process.env.PASS,
      },
    });

    const mailOptions = {
      from: `"Artopia Support" <${process.env.USER}>`,
      to,
      subject,
      html: html || `
      <div style="font-family: Arial, sans-serif; color: #333;">
        <h3>${subject}</h3>
        <p>${text}</p>
        <br/>
        <p>Best regards,</p>
        <p><strong>Artopia Team</strong></p>
      </div>
    `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent:', info.messageId);
  } catch (error: any) {
    console.error('❌ Failed to send email:', error.message);
    throw new Error('Failed to send email');
  }
}

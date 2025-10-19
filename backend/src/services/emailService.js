exports.send = async (to, subject, body) => {
  // Stub: in production replace with nodemailer or similar
  console.log(`Email to=${to} subject=${subject}`);
  return true;
};

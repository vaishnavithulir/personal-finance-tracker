const bcrypt = require('bcryptjs');
const hash = '$2b$10$XJ/IdH7NfyVQ75ZYuvD6BOUHq8etuo1shwMQ2zsKE2kT/mzBplNQC';
const password = 'password123';

bcrypt.compare(password, hash).then(res => {
    console.log('Match:', res);
});

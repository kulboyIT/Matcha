const fs = require('fs');
const { validateTagsInDb } = require('./profile');

const validateGender = gender => {
    let errors = {};
    if (!gender) {
        errors['error'] = 'Gender is missing';
    } else if (!['man', 'woman'].includes(gender)) {
        errors['error'] = 'Gender should be man or woman';
    }
    return errors;
};

const validateSexPreferences = sexPreference => {
    let errors = {};
    if (!sexPreference) {
        errors['error'] = 'Sex preference is missing';
    } else if (!['man', 'woman', 'both'].includes(sexPreference)) {
        errors['error'] = 'Sex preference should be man, woman or both';
    }
    return errors;
};

const validateBio = bio => {
    let errors = {};
    if (!bio) {
        errors['error'] = 'Bio is missing';
    }
    if (bio.length > 200) {
        errors['error'] = 'Bio should be less between 1 to 200 characters';
    }
    return errors;
};

const validateName = name => {
    let errors = {};
    if (!name) {
        errors['error'] = 'Name is missing';
    }
    if (name.length > 25) {
        errors['error'] = 'Should be between 1 to 25 characthers';
    }
    return errors;
};

const validateTags = async tags => {
    let errors = {};
    if (!tags || tags.length < 5) {
        errors['error'] = 'You should pick at least 5 interest';
    } else if (!(await validateTagsInDb(tags))) {
        errors['error'] = 'Invalid tags, some of them dont exist';
    }
    return errors;
};

const getAge = dob => {
    var today = new Date();
    var birthDate = new Date(dob);
    var age = today.getFullYear() - birthDate.getFullYear();
    var m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
};

const validateBirthdate = dob => {
    let errors = {};
    let age = getAge(dob);
    if (age < 18) {
        errors['error'] = 'You must be at least 18 years old to user our services';
    } else if (age > 120) {
        errors['error'] = 'You must be alive to user our services';
    }
    return errors;
};

const saveToFile = baseImage => {
    //path of folder to save the image
    const uploadPath = `${process.cwd()}/images/`;

    //Find extension of file
    const ext = baseImage.substring(baseImage.indexOf('/') + 1, baseImage.indexOf(';base64'));
    const fileType = baseImage.substring('data:'.length, baseImage.indexOf('/'));
    const regex = new RegExp(`^data:${fileType}\/${ext};base64,`, 'gi');

    const base64Data = baseImage.replace(regex, '');
    const rand = Math.ceil(Math.random() * 1000);
    //Random photo name with timeStamp so it will not overide previous images.
    const filename = `Photo_${Date.now()}_${rand}.${ext}`;

    //Check that if directory is present or not.
    if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath);
    }
    fs.writeFileSync(uploadPath + filename, base64Data, 'base64');
    return filename;
};

const deleteFromFile = filename => {
    const uploadPath = `${process.cwd()}/images/`;
    let files = fs.readdirSync(uploadPath);
    for (let i = 0; i < files.length; i++) {
        if (files[i] === filename) {
            fs.unlinkSync(uploadPath + filename);
            break;
        }
    }
};

const buildQueryForSavingTags = (tags, user_id) => {
    let query = {
        values: [],
        placeholder: '',
    };

    for (const element of tags) {
        query.values.push(user_id);
        query.values.push(element);
    }
    query.placeholder = '';
    let i = 1;
    let length = tags.length;
    while (length > 0) {
        j = i + 1;
        query.placeholder += '($' + i + ',' + ' (SELECT tag_id FROM tags WHERE tag_name = $' + j + '))';
        if (length != 1) query.placeholder += ',';
        i = i + 2;
        length--;
    }
    return query;
};

module.exports = {
    validateGender,
    validateSexPreferences,
    validateBio,
    validateBirthdate,
    validateName,
    validateTags,
    getAge,
    saveToFile,
    deleteFromFile,
    buildQueryForSavingTags,
};

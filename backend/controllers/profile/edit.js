const bcrypt = require('bcrypt');
const profileModel = require('../../models/profile');
const profileHelper = require('../../models/profileHelper');
const accountHelper = require('../../models/accountHelper');

const general = async (req, res) => {
    let { key, value } = req.body;
    const userId = req.user.userId;
    // console.log('body', req.body);

    let error = {};

    // Validate new profile info
    switch (key) {
        case 'name':
            error = profileHelper.validateName(value.firstname, 'firstname');
            error = { ...error, ...profileHelper.validateName(value.lastname, 'lastname') };
            break;
        case 'sex_preference':
            error = profileHelper.validateSexPreferences(value.sexPreference);
            error = { ...error, ...profileHelper.validateGender(value.gender) };
            break;
        case 'bio':
            error = profileHelper.validateBio(value);
            break;
        case 'birth_date':
            error = profileHelper.validateBirthdate(value);
            break;
        case 'username':
            error = accountHelper.validateUsername(value);
            break;
        case 'email':
            if (await accountHelper.checkPassword(userId, value.password)) {
                error = await accountHelper.validateEmail(value.email);
                value = value.email;
            } else {
                error = { passwordError: 'wrong password' };
            }
            break;
        case 'password':
            if (await accountHelper.checkPassword(userId, value.oldPassword)) {
                error = await accountHelper.validatePassword(value.newPassword, value.confirmPassword);
                value = await bcrypt.hash(value.newPassword, 10);
            } else {
                error = { oldPasswordError: 'wrong password' };
            }
            break;
        case 'country':
            break;
        default:
            return res.json({ error: 'Invalid parameters' });
    }
    // Check for validation errors
    if (Object.keys(error).length !== 0) {
        return res.json({ error: error });
    }
    // console.log('error', error);
    // Update profile parameter
    try {
        if (key === 'name') {
            await profileModel.editProfile(userId, 'first_name', value.firstname);
            await profileModel.editProfile(userId, 'last_name', value.lastname);
        } else if (key === 'sex_preference') {
            await profileModel.editProfile(userId, 'sex_preference', value.sexPreference);
            await profileModel.editProfile(userId, 'gender', value.gender);
        } else {
            const r = await profileModel.editProfile(userId, key, value);
        }
        return res.json({ msg: 'Your profile was successfully updated' });
    } catch (e) {
        return res.json({ error: 'Something went wrong adding Profile info' });
    }
};

const tags = async (req, res) => {
    const { value } = req.body;
    let tagsError = profileHelper.validateTags(value);
    if (tagsError.error) return res.json(tagsError);
    try {
        // Crosscheck the list of new tags with default tags in the database
        let validateTagsInDb = await profileModel.validateTagsInDb(value);
        if (!validateTagsInDb) {
            return res.json({ error: 'Invalid tags, some of them dont exist' });
        }
        // Remove old tags if user has any
        const userTags = await profileModel.userHasTags(req.user.userId);
        if (userTags) {
            await profileModel.deleteRowOneCondition('user_tags', 'user_id', req.user.userId);
        }
        // Build query to insert tags into database
        const query = profileHelper.buildQueryForSavingTags(value, req.user.userId);

        // Insert tags to the database
        await profileModel.saveTags(query);

        return res.json({ msg: 'Tags were successfully updated' });
    } catch (e) {
        return res.json({ error: 'Something went wrong adding tags to the database' });
    }
};

module.exports = {
    general,
    tags,
};

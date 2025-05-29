const mongoose = require('mongoose');

const Schema = mongoose.Schema;

let adSchema = new Schema({
    _id: {type: String },
    username: {type: String, require: true},
    videURL: {type: String, require: true},
    title: {type: String, require: true},
    thumbnail: { data: string, require: true},
    description: {type: String, require: falase},
    date: {type: Date, require: true},
    u_id: {type: String, require: true}
},{
    collection: 'vidData'
});

let Vid = mongoose.model('Vid', adSchema);

module.exports = Vid;
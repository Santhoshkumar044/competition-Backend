import mongoose from "mongoose";
const templateschema =new mongoose.Schema({
    title:String,
    description:String,
    collegeName:String,
    roomnumber:String,
    EventDate:Date,
    StartTime:Date,
    endTime:Date
});

export default function createtemplateModel(db){
    return db.models.template || db.model('template', templateschema);
}
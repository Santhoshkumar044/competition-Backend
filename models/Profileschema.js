import mongoose from 'mongoose';

const profileSchema = new mongoose.Schema({
  fullName:{type: String,required: true},
  Dept:{type: String,required: true},
  RegNo:{type:String,required:true,unique:true},
  batch:{type: String,required:true},
  email:{type:String,required:true},
  Gender:{type:String,required:true},
  domain:{type:String},
  bio:{type: String},
  competitionStats:{
    attended:{type: Number,default: 0},
    won:{type: Number,default: 0}}
},{ timestamps: true });

export default mongoose.model('Profile', profileSchema);
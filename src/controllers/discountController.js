const { json } = require('body-parser');
const db = require('../database/db');
const env =  require('dotenv').config()


exports.createCode=(req,res)=>{

    const discount_code = req.body['discount_code'];
    const description = req.body['description'];
    const date = new Date(req.body['date_validity']);
    const year = date.getFullYear().toString()
    
    const month = (date.getMonth()+1).toString().padStart(2,0)
    const day = date.getDate().toString().padStart(2,0)
    const date_validity = `${year}-${month}-${day}`

    const discountSql = `INSERT INTO discount (discount_code, description, date_validity) VALUES ('${discount_code}','${description}','${date_validity}')`

    db.query(discountSql,(err,data)=>{

        if(err){

            res.status(400).json({message:"Insert failed",error:err})

        }else{

            res.status(200).json({message:"Discount Code created successfully",error:data})

        }
    })

}

exports.deleteCode=(req,res)=>{


    const discount_code = req.params.code;
    const deleteSql = `DELETE FROM discount WHERE discount_code = "${discount_code}"`
    db.query(deleteSql,(err,data)=>{

        if(err){

            res.status(400).json({message:"delete failed",error:err})

        }else{

            res.status(200).json({message:"Discount Code Deleted successfully",error:data})


        }

    })

}
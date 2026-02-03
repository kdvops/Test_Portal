// IMPORT MONGOOSE FOR OBJECTID VALIDATION
import { Types } from 'mongoose';

export const isObjectId = (param:string):boolean => {
    try{
        new Types.ObjectId(param)        
        return true
    }
    catch(ex){}
    return false
}
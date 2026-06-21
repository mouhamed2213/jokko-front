import { User } from "lucide-react"

type User  = {
    prenom : string ,
    nom : number ,
    age : number,
    maj: boolean ,
}


type basedOnUser = {
    [ k in keyof User] : {
        type : k
    }
}[keyof User]

const userType  : basedOnUser    = {type: "maj"}


if(userType.type === "maj"){
    console.log(userType.type)
}


import React from "react";
import './adminTopbar.scss';
import { EnvelopeSimple, BellSimple, CaretDown } from "@phosphor-icons/react";

const AdminTopbar = ()=>{
    return(
        <div className="adminTopbar">
            <div className="wrapper">
                <div className="iconsContainer">
                <div className="icons">
                    <EnvelopeSimple size={24}/>
                    <BellSimple size={24}/>
                </div>
                <img src="https://i.pinimg.com/564x/b9/62/7c/b9627cb81085f9f29b28594076b50ec2.jpg" alt="" />
                <CaretDown className="more"/>
                </div>
            </div>
        </div>
    )
}

export default AdminTopbar;
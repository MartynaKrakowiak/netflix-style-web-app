import React from "react";
import "./footer.scss"
import {FacebookLogo, InstagramLogo, TwitterLogo, YoutubeLogo} from "@phosphor-icons/react";
const Footer = ()=>{
    return(
    <div className="footer">
        <div className="socials">
            <div className="icons">
                <FacebookLogo className ="icon" size={26} weight="fill"/>
                <InstagramLogo className ="icon" size={26}/>
                <TwitterLogo className ="icon" size={26} weight="fill"/>
                <YoutubeLogo className ="icon" size={26} weight="fill"/>
            </div>
        </div>
        <div className="links">
            <span>Audio Description</span>
            <span>Accessibility</span>
            <span>Help Center</span>
            <span>Terms of Use</span>
            <span>Privacy</span>
            <span>Cookies Preferences</span>
            <span>Corporate Information</span>
            <span>Contact Us</span>
            <span>Legal Notices</span>
            <span>Investor Relations</span>
            <span>Careers</span>
            <span>Redeem Gift Cards</span>
            <span>Media Center</span>
        </div>
    </div>
)
}

export default Footer;
import React from 'react'
import { FaUsers, FaClock, FaHandshake, FaBriefcase, FaLink, FaPaperPlane } from 'react-icons/fa';

const INVITE_TITLE = "Job-huting Made Easy"

const SIGN_UP_CONTENT = "Click on sign in button in the navbar that you see on top and then enter your sign-in credentials.";
const SEARCH_JOB_CONTENT = "Search for job in search bar on the landing page. Enter your desired job and click on the magnifying job or simply press enter.";
const APPLY_CONTENT = "You can now see various job postings. Select your desired job posting and click on Apply button at the bottom of the job posting."
const JOB_CONTENT = "Relax and wait for your application status. When you get hired, do a good job and your payments will be made digitally and moderated by us."


const employer_benefits = [
    [FaUsers, "Tap into a broad network of skilled individuals all across India"],
    [FaClock, "Quickly post jobs and receive applications"],
    [FaHandshake, "Find employees to do both long-term and short-term projects"]
]
const EMPLOYER_BENEFITS_TITLE = "What's in it for employers ?"

const job_seeker_benefits = [
    [FaBriefcase, "Access to a Wide Range of Opportunities all across India"],
    [FaLink, "Direct Employer Connections with no middle men"],
    [FaPaperPlane, "Easy Application Process"]
]
const JOB_SEEKER_BENEFITS_TITLE = "What's in it for job seekers ?"




const BenefitTitle = ({content}) => {
    return (
        <div className="text-[3vw] text-bold flex items-center justify-center">
            {content}
        </div>
    )
}

const BenefitDesc = ({Icon, content}) => {
    return (
        <div className="flex flex-row space-x-[1vw] flex items-center justify-center">
            <Icon className="w-[1.5vw] h-[1.5vw]"/>
            <div className="text-[1.5vw] w-3/4 text-wrap">{content}</div>
        </div>
    )
}

const BenefitsCard = ({benefit_title, benefits}) => {
    return (
        <div className = "bg-white h-fit w-fit py-[2vw] space-y-[1vw] rounded-3xl flex flex-col">
            <BenefitTitle content={benefit_title}/>
            {benefits.map((benefit, index) => (
                <BenefitDesc Icon={benefit[0]} content={benefit[1]} className="items-center justify-center"/>
            ))}
        </div>
    )
}



const StepIcon = ({index}) => {
    return (
        <div className="bg-white rounded-full w-[3vw] h-[3vw] text-[1vw] border-solid border-2 border-black 
                        flex justify-center items-center">
            {index}
        </div>
    )
}

const StepHeading = ({content}) => {
    return(
        <div className="text-[1.5vw] text-bold">
            {content}
        </div>
    )
}

const StepDesc = ({content}) => {
    return (
        <div className="text-wrap">
            {content}
        </div>
    )
}

const Step = ({index, step_title, step_desc}) => {
    return(
        <div className="flex flex-col items-center space-y-[1vw]">
            <StepIcon index={index}/>
            <StepHeading content={step_title}/>
            <StepDesc content={step_desc}/>
        </div>
    )
}

const Steps = () =>{
    return(
        <div className="w-full grid grid-cols-4 space-x-[5vw]">
            <Step index="1" step_title="Sign-Up" step_desc={SIGN_UP_CONTENT}/>
            <Step index="2" step_title="Search Job" step_desc={SEARCH_JOB_CONTENT}/>
            <Step index="3" step_title="Apply" step_desc={APPLY_CONTENT}/>
            <Step index="4" step_title="Do A Good Job" step_desc={JOB_CONTENT}/>
        </div>
    )
}




function Invite() {
  return (
    <div data-scroll data-scroll-speed="0.2" className='w-full bg-orange-400 overflow-hidden 
                                                        py-[5vw] space-y-[7vw]'>
        <div className="grid grid-cols-2">
            <div className="mx-auto">
                <BenefitsCard benefits={employer_benefits} benefit_title={EMPLOYER_BENEFITS_TITLE}/>
            </div>
            <div className="mx-auto">
                <BenefitsCard benefits={job_seeker_benefits} benefit_title={JOB_SEEKER_BENEFITS_TITLE}/>
            </div>
        </div>
        <div className="bottom flex flex-col space-y-[7vw] items-center justify-center space-y-[4vw] my-[4vw] mx-[1.5vw] bg-orange-400">
            <h1 className="text-black lg:text-[3vw] sm:text-[5vw] font-semibold">{INVITE_TITLE}</h1>
            <Steps/>
        </div>

    </div>
  )
}

export default Invite
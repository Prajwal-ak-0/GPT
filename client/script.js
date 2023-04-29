import bot from "./assets/bot.svg"
import user from "./assets/user.svg"

const form=document.querySelector('form');
const chatContainer=document.querySelector('#chat_container');
const changeInput=(value)=>{
  const inputElement=document.querySelector('textarea');
  inputElement.value=value;
}
const historyElement=document.querySelector('ul');
const buttonElement=document.querySelector('.buton')
const welcomeBack = document.getElementById('welcome-back');
setTimeout(() => {
  welcomeBack.classList.add('fade-out');
  setTimeout(() => {
    welcomeBack.remove();
  }, 1000); // wait for 1 second after fade-out animation
}, 2000); // wait for 2 seconds before fade-out animation

let loadInterval;

function loader(element){
  element.textContent='';

  loadInterval=setInterval(()=>{
    element.textContent+='.';

    if(element.textContent==='....'){
      element.textContent='';
    }
  },30000);
};

function typeText(element,text){
  let index=0;

  let interval=setInterval(()=>{
    if(index<text.length){
      element.innerHTML+=text.charAt(index);
      index++;
    }else{
      clearInterval(interval);
    }
  },20)
};

function generateUniqueId(){
  const timeStamp=Date.now();
  const randomNumber=Math.random();
  const hexaString=randomNumber.toString(16);

  return `id-${timeStamp}-${hexaString}`
}

function chatStripe(isAi,value,uniqueId){
  return(
    `
      <div class="wrapper ${isAi && 'ai'}">
        <div class="chat">
          <div class="profile">
            <img 
              src="${isAi ? bot : user}"
              alt="${isAi ? 'bot':'user'}"
            />
          </div>
          <div class="message" id=${uniqueId}>${value}</div>
        </div>
      </div> 
    `
  )
}

const handleSubmit=async (e)=>{
  e.preventDefault();

  const data=new FormData(form);

  //USER'S CHAT STRIPE
  chatContainer.innerHTML+=chatStripe(false,data.get('prompt'));

  form.reset();

  //LOADER
  const uniqueId=generateUniqueId();
  chatContainer.innerHTML+=chatStripe(true,"",uniqueId);
  chatContainer.scrollTop  = chatContainer.scrollHeight;

  const messageDiv=document.getElementById(uniqueId);
  loader(messageDiv);

  //fetching the data from server

  const response=await fetch('https://gpt-81sf.onrender.com/',{
    method:'POST',
    headers:{
      'Content-Type':'application/json'
    },
    body:JSON.stringify({
      prompt:data.get('prompt')
    })
  })
  const pElement=document.createElement('li');
  pElement.textContent=data.get('prompt');
  pElement.addEventListener('click',()=>changeInput(pElement.textContent));
  historyElement.append((pElement));

  clearInterval(loadInterval);
  messageDiv.innerHTML='';

  if(response.ok){
    const data=await response.json();
    const parsedData=data.bot.trim();

    typeText(messageDiv,parsedData);
  }else{
    const err=await response.text();
    messageDiv.innerHTML="Something Went Wrong!";
    alert(err);
    console.log(err)
  }
}

form.addEventListener('submit',handleSubmit);
form.addEventListener('keyup',(e)=>{
  if(e.keyCode === 13){
    handleSubmit(e);
  }
})

buttonElement.addEventListener('click',()=>window.location.reload())
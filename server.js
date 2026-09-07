import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const app=express();
const __filename=fileURLToPath(import.meta.url);
const __dirname=path.dirname(__filename);
const PORT=process.env.PORT||10000;

app.use(express.json({limit:'1mb'}));

app.get('/api/health',(_req,res)=>res.json({ok:true,service:'NEXURA NOVA'}));

app.post('/api/nova',async(req,res)=>{
  try{
    const {message,history=[]}=req.body||{};
    if(typeof message!=='string'||!message.trim()) return res.status(400).json({error:'Please enter a message.'});
    if(message.length>4000) return res.status(400).json({error:'Message is too long.'});
    if(!process.env.GROQ_API_KEY) return res.status(503).json({error:'NOVA is not configured yet. Add GROQ_API_KEY in Render.'});

    const cleanHistory=Array.isArray(history)?history.slice(-8)
      .filter(x=>x&&typeof x.text==='string')
      .map(x=>({role:x.from==='user'?'user':'assistant',content:x.text.slice(0,4000)})) : [];

    const groqResponse=await fetch('https://api.groq.com/openai/v1/chat/completions',{
      method:'POST',
      headers:{
        'Authorization':'Bearer '+process.env.GROQ_API_KEY,
        'Content-Type':'application/json'
      },
      body:JSON.stringify({
        model:process.env.GROQ_MODEL||'llama-3.3-70b-versatile',
        messages:[
          {role:'system',content:'You are NOVA, the friendly AI companion inside NEXURA, an entertainment hub. Help users discover movies, shows, music, anime, videos and entertainment. Be concise, warm and useful. Do not claim to stream copyrighted content or access private accounts.'},
          ...cleanHistory,
          {role:'user',content:message.trim()}
        ],
        temperature:0.8,
        max_tokens:700
      })
    });

    const data=await groqResponse.json();
    if(!groqResponse.ok){
      console.error('Groq API error:',data);
      return res.status(groqResponse.status).json({error:data?.error?.message||'Groq could not process the request.'});
    }
    const reply=data?.choices?.[0]?.message?.content?.trim();
    if(!reply) return res.status(502).json({error:'NOVA received an empty response.'});
    res.json({reply});
  }catch(error){
    console.error('NOVA server error:',error);
    res.status(500).json({error:'NOVA had a temporary problem. Please try again.'});
  }
});

const distPath=path.join(__dirname,'dist');
app.use(express.static(distPath));
app.get('/{*splat}',(_req,res)=>res.sendFile(path.join(distPath,'index.html')));

app.listen(PORT,()=>console.log('NEXURA running on port '+PORT));

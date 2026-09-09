import express from 'express';
import path from 'path';
import {fileURLToPath} from 'url';
const app=express(),__filename=fileURLToPath(import.meta.url),__dirname=path.dirname(__filename),PORT=process.env.PORT||10000;
app.use(express.json({limit:'1mb'}));
app.get('/api/health',(_q,res)=>res.json({ok:true,service:'NEXURA NOVA + Discovery'}));

const tmdb=async(pathname)=>{if(!process.env.TMDB_API_KEY)throw new Error('TMDB_API_KEY is not configured.');const r=await fetch('https://api.themoviedb.org/3'+pathname,{headers:{Authorization:'Bearer '+process.env.TMDB_API_KEY,accept:'application/json'}});const d=await r.json();if(!r.ok)throw new Error(d.status_message||'TMDB request failed');return d};
app.get('/api/media/:type/:id',async(req,res)=>{try{const type=req.params.type==='tv'?'tv':'movie',id=encodeURIComponent(req.params.id);const [details,videos,providers]=await Promise.all([tmdb('/'+type+'/'+id+'?language=en-US'),tmdb('/'+type+'/'+id+'/videos?language=en-US'),tmdb('/'+type+'/'+id+'/watch/providers')]);const trailer=(videos.results||[]).find(v=>v.site==='YouTube'&&(v.type==='Trailer'||v.type==='Teaser')&&v.official)||(videos.results||[]).find(v=>v.site==='YouTube');const region=providers.results?.IN||providers.results?.US||Object.values(providers.results||{})[0]||{};res.json({id:details.id,type,title:details.title||details.name,overview:details.overview,poster:details.poster_path?'https://image.tmdb.org/t/p/w500'+details.poster_path:null,backdrop:details.backdrop_path?'https://image.tmdb.org/t/p/w1280'+details.backdrop_path:null,rating:details.vote_average,year:(details.release_date||details.first_air_date||'').slice(0,4),runtime:details.runtime||details.episode_run_time?.[0]||null,trailer:trailer?{key:trailer.key,name:trailer.name}:null,providers:[...(region.flatrate||[]),...(region.rent||[]),...(region.buy||[])].filter((v,i,a)=>a.findIndex(x=>x.provider_id===v.provider_id)===i).slice(0,8).map(v=>({name:v.provider_name,logo:v.logo_path?'https://image.tmdb.org/t/p/w92'+v.logo_path:null})),watchLink:region.link||null})}catch(e){console.error('Media details error',e);res.status(502).json({error:e.message||'Media details unavailable'})}});
const discoveryCache=new Map();
const fetchJsonFast=async(url,headers,timeout=7000)=>{
  const controller=new AbortController();
  const timer=setTimeout(()=>controller.abort(),timeout);
  try{
    const r=await fetch(url,{headers,signal:controller.signal});
    const d=await r.json();
    if(!r.ok)throw new Error(d.status_message||'Discovery provider unavailable');
    return d;
  }finally{clearTimeout(timer)}
};
app.get('/api/discover',async(req,res)=>{
  try{
    if(!process.env.TMDB_API_KEY)return res.status(503).json({error:'TMDB_API_KEY is not configured.'});
    const key=process.env.TMDB_API_KEY,base='https://api.themoviedb.org/3';
    const requested=[...new Set(String(req.query.languages||'').split(',').map(x=>x.trim()).filter(Boolean))].slice(0,10);
    const cacheKey=requested.length?requested.slice().sort().join(','):'default';
    const cached=discoveryCache.get(cacheKey);
    if(cached&&Date.now()-cached.time<300000)return res.json({...cached.data,cached:true});
    const get=url=>fetchJsonFast(base+url,{Authorization:'Bearer '+key,accept:'application/json'});
    const map=(x,type,language)=>({id:x.id,title:x.title||x.name,poster:x.poster_path?'https://image.tmdb.org/t/p/w500'+x.poster_path:null,rating:x.vote_average,mediaType:x.media_type||type,originalLanguage:x.original_language,requestedLanguage:language});
    const dedupe=a=>Array.from(new Map(a.map(x=>[x.id+'-'+x.mediaType,x])).values());
    const roundRobin=(groups,limit)=>{
      const out=[],seen=new Set(),max=Math.max(0,...groups.map(g=>g.length));
      for(let i=0;i<max&&out.length<limit;i++)for(const group of groups){
        const x=group[i],k=x&&x.id+'-'+x.mediaType;
        if(x&&!seen.has(k)){seen.add(k);out.push(x);if(out.length>=limit)break}
      }
      return out;
    };
    let data;
    if(requested.length){
      const jobs=requested.flatMap(l=>[
        {kind:'movie',language:l,promise:get('/discover/movie?with_original_language='+encodeURIComponent(l)+'&sort_by=popularity.desc&vote_count.gte=5&page=1')},
        {kind:'tv',language:l,promise:get('/discover/tv?with_original_language='+encodeURIComponent(l)+'&sort_by=popularity.desc&vote_count.gte=5&page=1')}
      ]);
      const settled=await Promise.allSettled(jobs.map(j=>j.promise));
      const movieGroups=requested.map(()=>[]),tvGroups=requested.map(()=>[]);
      settled.forEach((r,i)=>{
        if(r.status!=='fulfilled')return;
        const j=jobs[i],index=requested.indexOf(j.language);
        const target=j.kind==='movie'?movieGroups[index]:tvGroups[index];
        target.push(...(r.value.results||[]).map(x=>map(x,j.kind,j.language)));
      });
      const movies=roundRobin(movieGroups,36),tv=roundRobin(tvGroups,36);
      if(!movies.length&&!tv.length)throw new Error('Discovery provider is temporarily slow. Please try again.');
      const trending=roundRobin(requested.map((_,i)=>dedupe([...(movieGroups[i]||[]).slice(0,9),...(tvGroups[i]||[]).slice(0,9)])),36);
      data={trending,movies,tv,languages:requested,balanced:true};
    }else{
      const settled=await Promise.allSettled([
        get('/trending/all/day?language=en-US'),get('/movie/popular?language=en-US&page=1'),get('/tv/popular?language=en-US&page=1')
      ]);
      const trend=settled[0].status==='fulfilled'?settled[0].value.results:[],movie=settled[1].status==='fulfilled'?settled[1].value.results:[],tv=settled[2].status==='fulfilled'?settled[2].value.results:[];
      data={trending:trend.slice(0,18).map(x=>map(x,x.media_type||'movie')),movies:movie.slice(0,18).map(x=>map(x,'movie')),tv:tv.slice(0,18).map(x=>map(x,'tv')),languages:[]};
    }
    discoveryCache.set(cacheKey,{time:Date.now(),data});
    if(discoveryCache.size>30)discoveryCache.delete(discoveryCache.keys().next().value);
    res.json(data);
  }catch(e){
    console.error('Discovery error',e);
    res.status(502).json({error:e.message||'Discovery unavailable'});
  }
});

app.get('/api/youtube/search',async(req,res)=>{try{const q=String(req.query.q||'').trim();if(!q)return res.status(400).json({error:'Enter a search query.'});if(!process.env.YOUTUBE_API_KEY)return res.status(503).json({error:'YouTube search is not configured yet. Add YOUTUBE_API_KEY in Render.'});const url='https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=12&q='+encodeURIComponent(q)+'&key='+encodeURIComponent(process.env.YOUTUBE_API_KEY);const r=await fetch(url);const d=await r.json();if(!r.ok)throw new Error(d.error?.message||'YouTube API request failed.');res.json({items:(d.items||[]).map(x=>({id:x.id.videoId,title:x.snippet.title,channel:x.snippet.channelTitle,thumbnail:x.snippet.thumbnails?.medium?.url||x.snippet.thumbnails?.default?.url||''}))})}catch(e){console.error('YouTube search error',e);res.status(502).json({error:e.message||'YouTube search unavailable'})}});
app.post('/api/nova',async(req,res)=>{try{const{message,history=[],profile={}}=req.body||{};if(typeof message!=='string'||!message.trim())return res.status(400).json({error:'Please enter a message.'});if(!process.env.GROQ_API_KEY)return res.status(503).json({error:'NOVA is not configured yet. Add GROQ_API_KEY in Render.'});const clean=Array.isArray(history)?history.slice(-10).filter(x=>x&&typeof x.text==='string').map(x=>({role:x.from==='user'?'user':'assistant',content:x.text.slice(0,4000)})):[];const context='User preferences: saved apps '+JSON.stringify(profile.favorites||[])+'; recently opened '+JSON.stringify(profile.recent||[])+'.';const r=await fetch('https://api.groq.com/openai/v1/chat/completions',{method:'POST',headers:{Authorization:'Bearer '+process.env.GROQ_API_KEY,'Content-Type':'application/json'},body:JSON.stringify({model:process.env.GROQ_MODEL||'openai/gpt-oss-20b',messages:[{role:'system',content:'You are NOVA, NEXURA’s warm, clever entertainment AI. Give concise, genuinely useful recommendations for movies, shows, music, anime and videos. Use the provided preference context when relevant. Never claim you can stream copyrighted content or access private accounts.'},{role:'system',content:context},...clean,{role:'user',content:message.trim()}],temperature:.8,max_tokens:700})});const data=await r.json();if(!r.ok)return res.status(r.status).json({error:data?.error?.message||'Groq could not process the request.'});const reply=data?.choices?.[0]?.message?.content?.trim();if(!reply)return res.status(502).json({error:'NOVA received an empty response.'});res.json({reply})}catch(e){console.error('NOVA error',e);res.status(500).json({error:'NOVA had a temporary problem. Please try again.'})}});
const dist=path.join(__dirname,'dist');app.use(express.static(dist));app.get('/{*splat}',(_q,res)=>res.sendFile(path.join(dist,'index.html')));app.listen(PORT,()=>console.log('NEXURA running on '+PORT));
# ✨ studyrag ✨

studyrag is an ai-powered study companion that lets you upload your class notes and then ask questions about them. it uses retrieval-augmented generation (rag) to find the most relevant information in your notes and generate helpful responses. the goal is to make studying more interactive, efficient, and personal. :D


## what it is

studyrag is a web app that acts like a personalized ai tutor. you can upload your notes, lecture slides, or written materials, and then have a chat-style conversation with an assistant that understands your content.



## why i built it

i built studyrag because traditional studying feels inefficient. students collect endless documents and notes but rarely revisit them effectively. i wanted a tool that could help people actually engage with what they’ve written and remember it better. instead of reading pages of text, you can now ask direct questions like “what were the key ideas from chapter 3?” and get a precise, contextual answer. and i also have been wanting to build my own rag system for a while, so here it is!



## how i made it

<b>the project is built with:</b>
- next.js for the frontend and backend routes  
- supabase for authentication, file storage, and vector search using pgvector  
- openai’s gpt-4o-mini model for chat responses and embeddings  
- tailwindcss for styling and layout  
- typescript for consistency and maintainability  

<b>the system works by:</b>
1. taking user-uploaded text or notes  
2. splitting them into chunks and creating vector embeddings  
3. storing those embeddings in supabase  
4. when a user asks a question, the system finds the most relevant chunks and provides a contextual ai response  

<b>the ui includes:</b>
- a chat interface with live streaming responses  
- a sidebar for accessing previous chats  
- the ability to start new conversations and continue old ones  



## what i struggled with

- implementing vector search and understanding how embeddings interact with sql functions in supabase  
- handling real-time ai streaming responses without breaking react state updates  
- ensuring that new chats appear instantly in the sidebar and persist correctly in the database  
- syncing dashboard state between components like `previouschats` and `chatview` without remounting the entire ui  



## what i learned

- how to design and deploy a full retrieval-augmented generation system end to end  
- how to use supabase effectively for both database operations and vector storage  
- how to manage state updates in react during async streaming events  
- how small ui details—smooth scroll, message streaming, and visual consistency—affect usability and user trust  

<br><br>

<b>built with...  </b>  
next.js • supabase • openai • typescript • tailwindcss

[![Athena Award Badge](https://img.shields.io/endpoint?url=https%3A%2F%2Faward.athena.hackclub.com%2Fapi%2Fbadge)](https://award.athena.hackclub.com?utm_source=readme)
const getModelId = (taskOption) => {
  if (taskOption === "image") {
    return "gemini-pro-vision";
  } else {
    return "gemini-1.0-pro";
  }
};

const tryJsonParse = (text) => {
  try {
    return JSON.parse(text);
  } catch {
    return { error: { message: text } };
  }
};

const getSystemPrompt = async (userPrompt) => {
  var systemPrompt = `You are the core of TimeTrove, an innovative AI companion designed to transform under-utilized snippets of time into opportunities for personal growth, learning, and exploration. 
  Your mission is to inspire users to make the most of their fragmented time by suggesting personalized, creative, and actionable activities. 
  You are not just an assistant; you are a guide, motivator, and catalyst for positive change. 
  Your Objectives:
  Understand and Adapt: Grasp the nuances of each user interests, available time, and current context to provide highly personalized suggestions. 
  Inspire Action: Your suggestions should motivate users to take immediate action. Each idea must be concrete, achievable, and tailored to fit into short time frames.
  Foster Growth: Encourage personal development, learning, and wellness. Your ideas should not only entertain but also enrich users lives. 
  Promote Exploration: Introduce users to new experiences, skills, and perspectives. Help them step out of their comfort zones and discover new passions.
  Ensure Accessibility: All suggested activities should be accessible with minimal requirements, making it easy for users to engage with them right away. 
  How You Communicate: Clarity and Conciseness: Communicate ideas clearly and concisely, making sure users can quickly grasp and act on them. 
  Positivity and Encouragement: Maintain a positive tone that motivates and uplifts.  Your goal is to make personal growth enjoyable and rewarding. 
  Adaptability and Learning: Continuously learn from user feedback to refine and personalize future suggestions, improving user experience over time. 
  Remember:You are an integral part of users journeys towards a more fulfilled and enriched life. Your suggestions are the sparks that ignite curiosity, drive personal growth, and turn fleeting moments into treasures of lifelong learning and discovery. 
  
  Here are examples of the level of detail your suggestions will need to have: 
  1. Try this brainteaser: A man is looking at a photograph of someone. His friend asks who it is. The man replies: Brothers and sisters, I have none. But that mans father is my fathers son. Who was in the photograph? Answer: His son. 
  2. Listen to a Philosophy Podcast Episode. Podcast: Philosophize This! Episode: The Stoics - Seneca (Episode 94) Duration: Approximately 20 minutes 
  3. Study a Music Theory Concept. Concept: Introduction to Chord Progressions Activity: Learn about basic chord progressions such as the I-IV-V and ii-V-I progressions. Understanding chord progressions is fundamental to understanding harmony in music. Resource: Music Theory: Chord Progressions Explained. 
  4. Ponder over this Book Quote. Book: Mans Search for Meaning by Viktor E. Frankl.Quote: Between stimulus and response, there is a space. In that space is our power to choose our response. In our response lies our growth and our freedom. Make sure the entire free slot is utilized, if provided. Lastly, format your response by leaving a line between each idea. `;
  return systemPrompt + userPrompt;
};

chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  (async () => {
    if (request.message === "chunk") {
      // Split the user prompt
      // const modelId = getModelId(request.taskOption);
      const modelId = "gemini-1.0-pro"; 
      const userPromptChunks = chunkText(request.userPrompt, getCharacterLimit(modelId, request.task));
      sendResponse(userPromptChunks);
    } else if (request.message === "generate") {
      const { apiKey } = await chrome.storage.local.get({ apiKey: "" });
      const userPrompt = request.userPrompt;


      const systemPrompt = await getSystemPrompt(
        request.userPrompt,
      );

      let contents = [];

      if (request.taskOption === "image") {
        const [mediaInfo, mediaData] = userPrompt.split(',');
        const mediaType = mediaInfo.split(':')[1].split(';')[0];

        contents.push({
          parts: [
            { text: systemPrompt },
            {
              inline_data: {
                mime_type: mediaType,
                data: mediaData
              }
            }
          ]
        });
      } else {
        contents.push({
          parts: [{ text: systemPrompt }]
        });
      }

      try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-1.0-pro:generateContent`, {
        method: "POST",  
        headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": apiKey,
          },
          body: JSON.stringify({
            contents: contents,
            safetySettings: [{
              category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
              threshold: "BLOCK_NONE"
            },
            {
              category: "HARM_CATEGORY_HATE_SPEECH",
              threshold: "BLOCK_NONE"
            },
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_NONE"
            },
            {
              category: "HARM_CATEGORY_DANGEROUS_CONTENT",
              threshold: "BLOCK_NONE"
            }]
          })
        });

        sendResponse({
          ok: response.ok,
          status: response.status,
          body: tryJsonParse(await response.text())
        });
      } catch (error) {
        sendResponse({
          ok: false,
          status: 1000,
          body: { error: { message: error.stack, text: systemPrompt } }
        });
      }
    }
  })();

  return true;
});
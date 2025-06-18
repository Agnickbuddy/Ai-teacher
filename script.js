let innerUploadImage = document.querySelector(".inner-upload-image");
let input = innerUploadImage.querySelector("input");
let image = document.querySelector("#image");
let loading = document.querySelector("#loading");
let btn = document.querySelector("button");
let text = document.querySelector("#text");
let output = document.querySelector(".output");

const Api_url =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=AIzaSyDddhhzfQOxiLHycDtX_ziZzf0Pb3e-M_M";

let fileDetails = {
  mime_type: null,
  data: null,
};

// Load and preview image on file input
input.addEventListener("change", () => {
  const file = input.files[0];
  if (!file) return;

  let reader = new FileReader();
  reader.onload = (e) => {
    let base64data = e.target.result.split(",")[1];
    fileDetails.mime_type = file.type;
    fileDetails.data = base64data;

    // Hide text, show image
    innerUploadImage.querySelector("span").style.display = "none";
    innerUploadImage.querySelector("#icon").style.display = "none";
    image.style.display = "block";
    image.src = `data:${fileDetails.mime_type};base64,${fileDetails.data}`;
    output.style.display = "none";
  };

  reader.readAsDataURL(file);
});

// Trigger file input on upload box click
innerUploadImage.addEventListener("click", () => {
  input.click();
});

// Trigger API call on button click
btn.addEventListener("click", () => {
  if (!fileDetails.data) {
    alert("Please upload an image first.");
    return;
  }

  loading.style.display = "block";
  generateResponse();
});

// Function to send image to Gemini and get math solution
async function generateResponse() {
  const requestOptions = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            {
              text:
                "Solve the math problem in the image with detailed step-by-step explanation. " +
                "Only return plain text. Do not use LaTeX, markdown, **bold**, or symbols like \\boxed or $.",
            },
            {
              inline_data: {
                mime_type: fileDetails.mime_type,
                data: fileDetails.data,
              },
            },
          ],
        },
      ],
    }),
  };

  try {
    const response = await fetch(Api_url, requestOptions);
    const data = await response.json();

    let rawText =
      data?.candidates?.[0]?.content?.parts?.[0]?.text || "No answer found.";

    // Clean Gemini's response
    let cleaned = rawText
      .replace(/\$\$/g, "") // remove double $$
      .replace(/\$([^$]+)\$/g, "$1") // remove $...$
      .replace(/\\boxed{([^}]+)}/g, "$1") // remove \boxed{}
      .replace(/\*\*(.*?)\*\*/g, "$1") // remove markdown bold
      .trim();

    text.textContent = cleaned;
    output.style.display = "block";
  } catch (e) {
    text.textContent = "An error occurred. Check console.";
    console.error("API Error:", e);
  } finally {
    loading.style.display = "none";
  }
}

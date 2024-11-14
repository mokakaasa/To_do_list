<script setup>
import { ref, onMounted, nextTick } from 'vue'

// Reactive references for the tasks and elements
const text = ref('')  // Text to render in the span
const spanRef = ref(null)  // Reference for the span element
const bodyRef = ref(null)  // Reference for the body element
const checkboxesState = ref([])  // Array to track checked state of each checkbox

// Function to check if the span's height exceeds the body's height
const checkOverflow = () => {
  // Check if refs exist before measuring
  if (!spanRef.value || !bodyRef.value) return;

  // Get the heights
  const spanHeight = spanRef.value.offsetHeight;
  const bodyHeight = bodyRef.value.offsetHeight;

  // Log the heights to debug
  console.log(`Span height: ${spanHeight}, Body height: ${bodyHeight}`);

  // If the span's height exceeds the body's height, refresh the page
  if (spanHeight > bodyHeight) {
    console.log("Overflow detected, reloading page...");
    location.reload(); // Refresh the page
  }
}

// Function to update the textarea with bullets and span with checkboxes
const writeText = (event) => {
  const lines = event.target.value.split('\n')

  // Add bullets to the beginning of each new line if it doesn't already start with one
  event.target.value = lines.map(line => {
    return line.startsWith('•') ? line : `• ${line}`  // Only add bullet if the line doesn't start with one
  }).join('\n')

  // Synchronize the checkboxesState with the number of lines
  if (lines.length > checkboxesState.value.length) {
    // Add false values (unchecked) for new lines
    checkboxesState.value.push(...Array(lines.length - checkboxesState.value.length).fill(false))
  } else if (lines.length < checkboxesState.value.length) {
    // Remove excess entries if lines were deleted
    checkboxesState.value = checkboxesState.value.slice(0, lines.length)
  }

  // Update the span content with checkboxes, maintaining the checked state
  text.value = lines.map((line, index) => {
    

    return line.startsWith('•')
      ? `<div style="${checkboxesState.value[index] ? 'color:black;text-decoration:line-through' : ''}"><input 
          type="checkbox" 
          ${checkboxesState.value[index] ? 'checked' : ''} 
          @change="toggleCheckbox(${index})"
        > ${line.substring(2)}</div>`
      : ''
  }).join('<br>')

  nextTick(() => {
    // Ensure everything is updated after DOM changes
    attachCheckboxListeners()  // Attach the event listeners to the checkboxes
    checkOverflow()  // Check if overflow occurs after rendering
  })

  
}

// Function to toggle checkbox state
const toggleCheckbox = (index) => {
  console.log(index)
  checkboxesState.value[index] = !checkboxesState.value[index]; // Toggle the checked state of the checkbox

   // Get the associated span element by index
  const span = document.querySelectorAll('#span span div')[index];
  
  // Apply or remove the style based on the checked state
  if (checkboxesState.value[index]) {
    // If checked, apply black color and line-through
    span.style.color = 'black';
    span.style.textDecoration = 'line-through';
  } else {
    // If unchecked, revert the styles
    span.style.color = 'rgb(110, 4, 4)';
    span.style.textDecoration = 'none';
  }
}

// Attach change event listeners to each checkbox
const attachCheckboxListeners = () => {
  const checkboxes = document.querySelectorAll('input[type="checkbox"]')
  checkboxes.forEach((checkbox, index) => {
    checkbox.onchange = () => toggleCheckbox(index)  // Bind toggleCheckbox to each checkbox
  })
}

const handleSubmit = async () => {
  const tasks = document.querySelector('#textarea').value.replaceAll('• ','').split("\n"); // Extract the plain text tasks from the HTML
  const status_id = checkboxesState.value.map((checked) => (checked ? 1 : 2)); // Map checked boxes to status_ids (1 = completed, 2 = pending, etc.)

  try {
    // Send data to the backend using fetch or Axios
    const response = await fetch('/store', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tasks: tasks,
        status_id: status_id, // Send the checkbox states
      }),
    });

    const result = await response.json();
    console.log(result.message); // Success message from the server
  } catch (error) {
    console.error('Error submitting tasks:', error);
  }
  window.location.replace('/today').reload(); // Refresh the page
  window.location.href = '/today';
}

// Mount logic to handle initial rendering
onMounted(() => {
  nextTick(() => {
    attachCheckboxListeners()  // Attach event listeners when component is mounted
    checkOverflow()
  })
})
</script>

<template>
  <title>TO-DO LIST</title>
  <h1 id="title"><i>Jot Down Your Desired Tasks</i></h1>

  <div id="body" ref="bodyRef">
    <div id="app">
      <!-- Input area for the user to type tasks -->
      <textarea id="textarea" @input="writeText" rows="8" cols="30" placeholder="Start writing.."></textarea>
      <div id="span">
        <!-- Render checkboxes and tasks in the span, using v-html to update dynamically -->
        <span v-html="text" ref="spanRef"></span>
      </div>
      <button @click="handleSubmit">SAVE</button>
    </div>
  </div>
</template>

<style scoped>
#body {
  block-size: 600px;
  margin-left: 400px;
  margin-top: 40px;
  position: fixed;
  margin-right: 500px;
  width: 50%;
  /* Remove overflow: hidden to allow detection of overflow */
  overflow: auto;
}

h1 {
  position: absolute;
  left: 500px;
  top: 2px;
}

#app > div {
  background-image: url("/home/ascer/Desktop/ToDoList/notebook.jpg");
  background-size: 70%;
  background-repeat: no-repeat;
  background-attachment: fixed;
  background-position: center;
}

#app span {
  font-weight: bold;
  font-family: 'Courier New', Courier, monospace;
  transform-origin: 0 0;
  rotate: -38deg;
  position: absolute;
  top: 220px;
  left: 30px;
  color: rgb(110, 4, 4);
  word-break: break-word;
  white-space: pre-wrap;
  width: 300px;
}

#app textarea {
  width: 25%;
  height: 14%;
  box-sizing: border-box;
  position: fixed;
  margin-left: 12px;
  margin-top: 20px;
}
#app button {
  position: absolute;
  bottom: 200px; /* Distance from the bottom of the parent container */
  right: 20px;  /* Distance from the right of the parent container */
  background-color: white;  /* Corresponds to w3-white */
  border: 2px solid rgb(119, 133, 148);    /* Corresponds to w3-border and w3-border-red */
  border-radius: 16px;      /* Corresponds to w3-round-large (16px radius for large rounding) */
  padding: 8px 16px;        /* Corresponds to w3-button (padding around the button) */
  cursor: pointer;   
}

</style>
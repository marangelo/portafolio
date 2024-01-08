// Archivo: funciones.mjs
export function OnClickTo() {
  // Get the text field
  const copyText = document.getElementById("id_frm_email");

  // Select the text field
  copyText.select();
  copyText.setSelectionRange(0, 99999); // For mobile devices

  // Copy the text inside the text field
  navigator.clipboard.writeText(copyText.value)
    .then(() => {
      console.log("Text copied successfully");
      // Alert the copied text
      alert("Copied the text: " + copyText.value);
    })
    .catch((err) => {
      console.error("Unable to copy text", err);
    });
}

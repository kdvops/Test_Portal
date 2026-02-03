export function useForm(fields: any[]) {
  return `
    <form>
      ${fields
        .map((field) => {
          switch (field.type) {
            case "hidden":
              return `
                <input type="hidden" id="${field.id}" name="${field.name}"  v-model="formData.${field.name}" value="${field.value ? field.value : ""}">
              `;
            case "formText":
            case "formEmail":
            case "formNumber":
            case "formDate":
            case "formTextarea":
              return `
                <label for="${field.id}">${field.label}</label>
                <input type="${field.type === "formEmail" ? "email" : field.type === "formNumber" ? "number" : field.type === "formDate" ? "date" : "text"}"
                       id="${field.id}" name="${field.name}" v-model="formData.${field.name}" value="${field.value ? field.value : ""}" required>
              `;
            case "formSelect":
              return `
                <label for="${field.id}">${field.label}</label>
                <select id="${field.id}" name="${field.name}"  v-model="formData.${field.name}" value="${field.value ? field.value : ""}" required>
                  ${field.selects
                    .map((option: string) => `<option value="${option}">${option}</option>`)
                    .join("")}
                </select>
              `;
            default:
              return "";
          }
        })
        .join("")}
      <input type="submit" value="Enviar">
    </form>
  `;
}

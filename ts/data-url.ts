function getDataURL(src: string, callback: (data: string) => void) {

  fetch(src).then(resp => resp.blob()).then((blob) => {

    const reader = new FileReader();

    reader.addEventListener("load", () => {

      if (reader.result !== null) {

        callback(reader.result.toString());

      }

    })

    reader.readAsDataURL(blob);

  })

}

export default getDataURL;
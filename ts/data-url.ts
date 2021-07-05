type DataURLCallback = (data: string) => void;

type Data = string | null;

type DataCallback = (data: Data) => void;

function getDataURL(src: string, callback: DataURLCallback) {

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

export { Data, DataURLCallback, DataCallback, getDataURL };
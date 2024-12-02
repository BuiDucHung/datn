export async function upLoadImage(image) {
  const formData = new FormData();
  formData.append('file', image);
  formData.append('upload_preset', 'n1cxgw6j');
  const data = await fetch(`${process.env.API_ENDPOINT_UPLOAD}/api-cms/upload-file`, {
    method: 'POST',
    // headers: {
    //   'Content-Type': 'application/json'
    // },
    body: formData 
  })
 const res = await data.text();
 return res
  // const res = await Axios.post('https://api.cloudinary.com/v1_1/dgze4uhgg/image/upload', formData)
  // return res?.data?.url
}

import DOMPurify from 'isomorphic-dompurify';
import moment from 'moment';
const GCS_BASE_URL = 'https://storage.googleapis.com';
const IMG_START_TOKEN = '@PS@';
const IMG_END_TOKEN = '@PE@';

export const getStorageURL = (_url: string = '') => {
  if (!_url) return '';
  let url = _url;
  if (!url.startsWith(GCS_BASE_URL) && !url.startsWith('http') && !url.startsWith('file://'))
    url = url.startsWith('/') ? `${GCS_BASE_URL}${url}` : `${GCS_BASE_URL}/${url}`;
  return url;
};

export const getFormattedContentWithImg = (content: string) => {
  const regex = /(\@PS@)[/a-z0-9-_\.]*(\@PE@)/gi;
  let m: RegExpExecArray | null;
  let images: string[] = [];
  while ((m = regex.exec(content)) !== null) {
    if (m.index === regex.lastIndex) {
      regex.lastIndex++;
    }
    m.forEach((match, groupIndex) => {
      groupIndex == 0 && !images.includes(match) && images.push(match);
    });
  }
  if (images.length) {
    let style = `style="max-width: 70%; margin: 0px auto; display: block;"`;
    images.map((e, i) => {
      let image = e.replace(IMG_START_TOKEN, '').replace(IMG_END_TOKEN, '');
      if (!image.includes(GCS_BASE_URL)) {
        if (image.startsWith('/')) {
          image = image.substring(1, image.length);
        }
        image = `${GCS_BASE_URL}/` + image;
      }
      content = content.replace(e, `<img alt="${i}" src="${image}" ${style}></img>`);
    });
  }
  return content;
};

export const getPurifiedContent = (html: string | Node) => DOMPurify.sanitize(html);
export const isValidEmail = () =>
  /^[a-zA-Z0-9.!#$%&'+=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)$/gim;
export const isValidatePhoneNumber = () => /(09|08|02|03|04|05|06|07|01[1|2|3|4|5|6|7|8|9])+([0-9]{8})\b$/;
export const isValidateAccount = () => {
  return /^[0-9a-z/]+$/;
};
export const formatBarChartLabel = (str: string, maxwidth: number) => {
  var sections: string[] = [];
  var words = str.split(' ');
  var temp = '';

  words.forEach(function (item, index) {
    if (temp.length > 0) {
      var concat = temp + ' ' + item;
      if (concat.length > maxwidth) {
        sections.push(temp);
        temp = '';
      } else {
        if (index == words.length - 1) {
          sections.push(concat);
          return;
        } else {
          temp = concat;
          return;
        }
      }
    }
    if (index == words.length - 1) {
      sections.push(item);
      return;
    }
    if (item.length < maxwidth) {
      temp = item;
    } else {
      sections.push(item);
    }
  });
  return sections;
};

//remove html tag from a string
export const formatHTMLContent = (htmlContent: string) => {
  if (typeof window !== 'undefined') {
    const div = document.createElement('div');
    div.innerHTML = htmlContent;
    return div.innerText;
  }
  return htmlContent;
};

export const getFacebookShareLink = (url: string, quote?: string, hashtag?: string) => {
  const objectToGetParams = (object: { [key: string]: string | number | undefined | null }) => {
    const params = Object.entries(object)
      .filter(([, value]) => value !== undefined && value !== null)
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);

    return params.length > 0 ? `?${params.join('&')}` : '';
  };
  return (
    'https://www.facebook.com/sharer/sharer.php' +
    objectToGetParams({
      u: url,
      quote,
      hashtag
    })
  );
};

export const isPoint = (value) => {
  const _value = Number(value);
  return !!(_value >= 0 && _value <= 10);
};

export function formatDuration(
  time: any,
  unit: moment.unitOfTime.DurationConstructor,
  format: string
) {
  const _time = Number(time);
  return moment.utc(moment.duration(_time, unit).asMilliseconds()).format(format);
}
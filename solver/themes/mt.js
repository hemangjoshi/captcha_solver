const mtcapNetworkUrls = [
  "mtcv1/api/getchallenge.json",
  "mtcv1/api/getimage.json",
  "mtcv1/api/getaudio.json",
];

(function (xhr) {
  var XHR = XMLHttpRequest.prototype;

  var open = XHR.open;
  var send = XHR.send;

  XHR.open = function (method, url) {
    // console.log(url,"url open")
    this._method = method;
    this._url = url;
    return open.apply(this, arguments);
  };

  XHR.send = function (postData) {
    // console.log("im here");
    // console.log(JSON.parse(postData),"post")
    const _url = this._url;
    // console.log(_url, this.response, "url");
    this.addEventListener("load", function () {
      // console.log(JSON.parse(this.response),"response")
      const isInList = mtcapNetworkUrls.some((url) => _url.indexOf(url) !== -1);
      // console.log(isInList,"inlist")
      if (isInList) {
        window.postMessage(
          { type: "xhr", data: this.response, url: _url, captchaType: "mt" },
          "*"
        );
      }
    });

    return send.apply(this, arguments);
  };
})(XMLHttpRequest);

(function () {
  let origFetch = window.fetch;
  window.fetch = async function (...args) {
    const _url = args[0];
    const response = await origFetch(...args);

    response
      .clone()
      .blob()
      .then(async (data) => {
        const isInList = mtcapNetworkUrls.some(
          (url) => _url.indexOf(url) !== -1
        );
        if (isInList) {
          window.postMessage(
            {
              type: "fetch",
              data: await data.text(),
              url: _url,
              captchaType: "mt",
            },
            "*"
          );
        }
      })
      .catch((err) => {
        console.log(err);
      });

    return response;
  };
})();

/**
 *
 */

type SolanaPayGetResponse = {
  /**
   * The <label> value must be a UTF-8 string that describes the source of the
   * transaction request. For example, this might be the name of a brand,
   * store, application, or person making the request.
   */
  label?: string;
  /**
   * The <icon> value must be an absolute HTTP or HTTPS URL of an icon image.
   * The file must be an SVG, PNG, or WebP image, or the wallet must reject
   * it as malformed.
   */
  icon?: string;
  /**
   * Other keys might be returned from the
   */
  // todo;
};

type SolanaPayPostResponse = {};

type ProxySolanaPayRequest = {
  get: SolanaPayGetResponse;
  post: SolanaPayPostResponse;
};

/**
 * Make and process the GET request for SolanaPay Transaction requests
 */
export async function proxySolanaPayRequest(
  url: string | URL,
  address: string,
): Promise<ProxySolanaPayRequest> {
  if (typeof url == "string") {
    url = new URL(url);
  }

  try {
    // todo: perform better handling and retires of these requests?
    const res = await fetch(`/api/solanapay`, {
      method: "POST",
      body: JSON.stringify({
        url: url.toString(),
        address,
      }),
    });

    const text = await res.text();
    console.log("text:", text);

    if (!res.ok) {
      console.log("Bad Response:");
      console.log(res);
      throw Error(text);
    }

    console.log("Good Response");

    try {
      const data: ProxySolanaPayRequest = JSON.parse(text);
      return data;
    } catch (err) {
      throw Error("Unable to parse proxy response");
    }
  } catch (err) {
    console.error("[proxySolanaPayRequest]", err);
  }

  // always return a correctly typed response
  return {
    get: {
      label: "[err]",
      icon: undefined,
    },
    post: {
      any: "todo",
    },
  };
}

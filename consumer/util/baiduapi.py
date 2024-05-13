import time
import requests
from config import BAIDU_CLIENT_ID, BAIDU_CLIENT_SECRET


class Baidu:
    _access_token = ""
    expires = 0

    @property
    def access_token(self):
        if time.time() < self.expires - 300:
            return self._access_token

        url = "https://aip.baidubce.com/oauth/2.0/token"
        headers = {"Content-Type": "application/json", "Accept": "application/json"}
        response = requests.request(
            "POST",
            url,
            headers=headers,
            params={
                "grant_type": "client_credentials",
                "client_id": BAIDU_CLIENT_ID,
                "client_secret": BAIDU_CLIENT_SECRET,
            },
        )
        resp_json = response.json()

        self._access_token = resp_json["access_token"]
        self.expires = time.time() + resp_json["expires_in"]

        return self.access_token

    def ocr(self, lang: str = "CHN_ENG", image_b64: str = None, image_url: str = None):
        url = "https://aip.baidubce.com/rest/2.0/ocr/v1/general"
        headers = {"Content-Type": "application/x-www-form-urlencoded"}

        if not image_b64 and not image_url:
            raise ValueError("image_b64 or image_url is required")

        payload = {"language_type": lang, "detect_direction": "true"}
        if image_b64:
            payload["image"] = image_b64
        else:
            payload["url"] = image_url

        try:
            response = requests.request(
                "POST",
                url,
                headers=headers,
                params={"access_token": self.access_token},
                data=payload,
            )

            return response.json()
        except Exception as e:
            return {
                "error_code": -1,
                "detail": response.text if "response" in locals() else None,
                "error_msg": str(e),
            }

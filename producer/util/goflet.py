import time
import uuid
from typing import Optional, List, Dict, Any
from urllib.parse import quote

import aiohttp
import jwt
from pydantic import BaseModel


class Permission(BaseModel):
    path: str
    methods: List[str]
    query: Dict[str, Any]


class Goflet:
    base_url: str
    jwt_algorithm: str
    jwt_secret: Optional[str]
    jwt_private_key: Optional[str]
    jwt_issuer: str
    jwt_expiration: int

    def __init__(
        self,
        base_url: str,
        jwt_algorithm: str,
        jwt_secret: Optional[str],
        jwt_private_key: Optional[str],
        jwt_issuer: str,
        jwt_expiration: int,
    ):
        self.base_url = base_url
        self.jwt_algorithm = jwt_algorithm
        self.jwt_secret = jwt_secret
        self.jwt_private_key = jwt_private_key
        self.jwt_issuer = jwt_issuer
        self.jwt_expiration = jwt_expiration
        self.no_exp = False

    @staticmethod
    def _generate_uuid() -> str:
        return str(uuid.uuid4())

    def _generate_header(self) -> dict:
        return {
            "alg": self.jwt_algorithm,
            "typ": "JWT",
        }

    def _generate_jwt(self, payload: dict) -> str:
        payload["iss"] = self.jwt_issuer
        payload["iat"] = payload.get("iat", int(time.time()))
        payload["nbf"] = payload.get("nbf", int(time.time()) - 1)
        if not self.no_exp:
            payload["exp"] = payload.get("exp", self.jwt_expiration + int(time.time()))
        payload["jti"] = f"{int(time.time())}-{self._generate_uuid()}"
        header = self._generate_header()

        if self.jwt_algorithm.startswith("HS"):
            secret = self.jwt_secret
        else:
            secret = self.jwt_private_key

        return jwt.encode(payload, secret, algorithm=self.jwt_algorithm, headers=header)

    def generate_jwt(self, permissions: List[Permission]) -> str:
        """
        Generate JWT token with permissions.
        :param permissions: Permissions
        :param user_id: User ID
        :return: JWT token
        """
        payload = {
            "permissions": [
                {
                    "path": permission.path,
                    "methods": permission.methods,
                    "query": permission.query,
                }
                for permission in permissions
            ],
        }
        return self._generate_jwt(payload)

    def generate_url(
        self, path: str, method: str, query: Dict[str, Any], no_exp=False
    ) -> str:
        """
        Generate URL with query parameters.
        :param path: URL path
        :param method: HTTP method
        :param query: Query parameters
        :param no_exp: No expiration
        :return: URL with query parameters
        """
        url = f"{self.base_url}{path}"
        if no_exp:
            self.no_exp = True
        jwt_token = self.generate_jwt(
            permissions=[Permission(path=path, methods=[method], query=query)]
        )
        self.no_exp = False
        query["token"] = jwt_token
        quoted_query = "&".join(f"{k}={quote(str(v))}" for k, v in query.items())
        return f"{url}?{quoted_query}"

    def create_upload_session(self, file_path: str) -> str:
        """
        Start upload session
        :param file_path: File path
        :return: URL with query parameters
        """
        return self.generate_url(f"/upload/{file_path}", "PUT", {})

    async def cancel_upload_session(self, file_path: str):
        """
        Cancel upload session
        :param file_path: File path
        """
        url = self.generate_url(f"/upload/{file_path}", "DELETE", {})
        req = aiohttp.request("DELETE", url)
        async with req as result:
            result.raise_for_status()

    def create_complete_upload_session(self, file_path: str) -> str:
        """
        Create complete upload session
        :param file_path: File path
        :return: URL with query parameters
        """
        return self.generate_url(f"/upload/{file_path}", "POST", {})

    async def complete_upload_session(self, file_path: str):
        """
        Complete upload session
        :param file_path: File path
        """
        url = self.generate_url(f"/upload/{file_path}", "POST", {})
        req = aiohttp.request("POST", url)
        async with req as result:
            result.raise_for_status()

    def create_download_url(self, file_path: str) -> str:
        """
        Complete upload session
        :param file_path: File path
        :return: URL with query parameters
        """
        return self.generate_url(f"/file/{file_path}", "GET", {})

    async def get_file_meta(self, file_path: str) -> Dict[str, Any]:
        """
        Get file metadata
        :param file_path: File path
        :return: File metadata
        """
        meta_url = self.generate_url(f"/api/meta/{file_path}", "GET", {})
        req = aiohttp.request("GET", meta_url)
        async with req as result:
            result.raise_for_status()
            return await result.json()

    async def delete_file(self, file_path: str):
        """
        Delete file
        :param file_path: File path
        :return: File metadata
        """
        meta_url = self.generate_url(f"/file/{file_path}", "DELETE", {})
        req = aiohttp.request("DELETE", meta_url)
        async with req as result:
            result.raise_for_status()

    async def create_empty_file(self, file_path: str) -> str:
        """
        Create empty file
        :param file_path: File path
        :return: File metadata
        """
        meta_url = self.generate_url(f"/api/action/create", "POST", {})
        payload = {
            "path": file_path,
        }
        req = aiohttp.request("POST", meta_url, json=payload)
        async with req as result:
            result.raise_for_status()
        return self.create_download_url(file_path)

    async def copy_file(
        self, file_path: str, new_file_path: str, on_conflict="overwrite"
    ) -> str:
        """
        Copy file
        :param file_path: File path
        :param new_file_path: New file path
        :param on_conflict: On conflict strategy
        :return: File metadata
        """
        meta_url = self.generate_url(f"/api/action/copy", "POST", {})
        payload = {
            "sourcePath": file_path,
            "targetPath": new_file_path,
            "onConflict": on_conflict,
        }
        req = aiohttp.request("POST", meta_url, json=payload)
        async with req as result:
            result.raise_for_status()
        return self.create_download_url(new_file_path)

    async def move_file(
        self, file_path: str, new_file_path: str, on_conflict="overwrite"
    ) -> str:
        """
        Move file
        :param file_path: File path
        :param new_file_path: New file path
        :param on_conflict: On conflict strategy
        :return: File metadata
        """
        meta_url = self.generate_url(f"/api/action/move", "POST", {})
        payload = {
            "sourcePath": file_path,
            "targetPath": new_file_path,
            "onConflict": on_conflict,
        }
        req = aiohttp.request("POST", meta_url, json=payload)
        async with req as result:
            result.raise_for_status()
        return self.create_download_url(new_file_path)

    async def onlyoffice_callback(self, data: Dict[str, Any], file_path: str):
        """
        OnlyOffice callback
        :param data: Callback data
        :param file_path: File path
        :return: None
        """
        meta_url = self.generate_url(f"/api/onlyoffice/{file_path}", "POST", {})
        req = aiohttp.request("POST", meta_url, json=data)
        async with req as result:
            result.raise_for_status()

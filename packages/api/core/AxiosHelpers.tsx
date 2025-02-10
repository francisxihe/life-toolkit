import { AxiosInstance } from "axios";
import { getEmbedAccessToken } from "./helper";
import { debounce } from "lodash-es";
import { Message } from "@arco-design/web-react";

const debouncedError = debounce(Message.error, 500);

/**
 * 服务端返回数据，要根据 body 中的 status 判断是否为成功的请求
 * @param {*} response
 */
export function responseSuccessHandler(response: any) {
  const resData = response.data;

  if (response?.config.responseType === "blob") {
    // 如果是下载文件，返回结果是 Blob
    return Promise.resolve(resData);
  }
  // 成功
  if (resData.code == 200) {
    return Promise.resolve(resData.data);
  }

  console.error("http request error: ", response);
  return Promise.reject(resData);
}

// 目前服务端错误信息都放在了 200 的 body 中，所以不用处理什么
export function responseErrorHandler(error: any) {
  function handleAuthError(error: any) {
    if (error.response.data.code == 10) {
      // debouncedError('您尚未登录，请先登录');
      // httpUnauthorizedToLogin();
    } else if (error.response.data.code == 11) {
      // debouncedError('登录已超时，请重新登陆');
      // httpUnauthorizedToLogin();
    } else if (error.response.data.code == 21) {
      debouncedError("token 校验错误");
    } else if (
      error.response.data.code == 40100 ||
      error.response.data.code == 40200
    ) {
      debouncedError("用户名或密码错误");
    } else if (error.response.data.code == 40400) {
      debouncedError("验证码错误");
    } else if (error.response.data.code == 40300) {
      debouncedError(
        error.response.data.message || "仅允许没有绑定其他方式的账号使用"
      );
    } else if (error.response.data.code == 40198) {
      debouncedError("用户登录频繁，请一分钟后重试");
    } else if (error.response.data.code == 40199) {
      debouncedError("密码错误次数超限，请一分钟后重试");
    } else if (error.response.data.code == 40210) {
      debouncedError("密码已失效，请联系管理员处理");
    } else if (error.response.data.code == 40220) {
      debouncedError("手机号错误");
    }

    localStorage.removeItem("token");
  }

  let errorText = "";
  if (error.response && error.response.data) {
    errorText = error.response.data.message || error.response.data.msg;
  } else {
    errorText = "未知错误";
  }

  switch (error.response && error.response.code) {
    case 401:
      handleAuthError(error);
      break;
    case 404:
      errorText = "资源不存在";
      break;
    case 500:
    case 501:
    case 502:
    case 503:
    case 504:
      errorText = "服务器异常";
      break;
    // 其他错误，直接抛出错误提示
    default:
  }

  console.error("请求状态非 200", error);

  return Promise.reject(error);
}

/**
 * 拦截 request，设置 token
 * @param {*} config
 */
export function setRequestToken(config: any) {
  // const token = getToken();
  // if (token) {
  //   config.headers['X-Authorization'] = token;
  // }
  // if (getEmbedAccessToken()) {
  //   config.headers['Access-Token'] = getEmbedAccessToken();
  // }
  return config;
}

/**
 * request 拦截器异常处理
 * @param {*} error
 */
export function interceptorErrorHandler(error: any) {
  return Promise.reject(error);
}

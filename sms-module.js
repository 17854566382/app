/**
 * 短信发送模块 - 腾讯云短信服务
 * 使用方法：
 * 1. 在腾讯云控制台开通短信服务
 * 2. 创建短信签名和模板
 * 3. 获取 SecretId 和 SecretKey
 * 4. 在 server.js 中引入此模块
 */

const crypto = require('crypto');
const https = require('https');

// 腾讯云短信配置
const SMS_CONFIG = {
  secretId: process.env.TENCENT_SECRET_ID || '',
  secretKey: process.env.TENCENT_SECRET_KEY || '',
  appId: process.env.TENCENT_SMS_APP_ID || '',
  signName: process.env.TENCENT_SMS_SIGN || '海宝新能源',
  region: 'ap-beijing'
};

/**
 * 生成腾讯云签名
 */
function generateSignature(params, secretKey) {
  const sortedKeys = Object.keys(params).sort();
  const signStr = sortedKeys.map(key => `${key}=${params[key]}`).join('&');
  return crypto.createHmac('sha256', secretKey).update(signStr).digest('hex');
}

/**
 * 发送短信（腾讯云 SMS API）
 */
async function sendSms(phone, templateId, params = []) {
  if (!SMS_CONFIG.secretId || !SMS_CONFIG.secretKey) {
    console.warn('[SMS] 短信服务未配置，跳过发送');
    return { success: false, message: '短信服务未配置' };
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const nonce = Math.random().toString(36).substring(2);

  // 手机号格式处理
  let phoneNumber = phone.replace(/\D/g, '');
  if (!phoneNumber.startsWith('+86')) {
    phoneNumber = '+86' + phoneNumber;
  }

  const requestBody = JSON.stringify({
    PhoneNumberSet: [phoneNumber],
    SmsSdkAppId: SMS_CONFIG.appId,
    SignName: SMS_CONFIG.signName,
    TemplateId: templateId,
    TemplateParamSet: params
  });

  const host = 'sms.tencentcloudapi.com';
  const path = '/';

  const paramsToSign = {
    Action: 'SendSms',
    Version: '2021-01-11',
    Region: SMS_CONFIG.region,
    Timestamp: timestamp,
    Nonce: nonce,
    SecretId: SMS_CONFIG.secretId,
    PhoneNumberSet: [phoneNumber],
    SmsSdkAppId: SMS_CONFIG.appId,
    SignName: SMS_CONFIG.signName,
    TemplateId: String(templateId),
    TemplateParamSet: JSON.stringify(params)
  };

  const signature = generateSignature(paramsToSign, SMS_CONFIG.secretKey);

  return new Promise((resolve) => {
    const options = {
      hostname: host,
      port: 443,
      path: path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(requestBody),
        'Authorization': signature,
        'X-TC-Action': 'SendSms',
        'X-TC-Version': '2021-01-11',
        'X-TC-Region': SMS_CONFIG.region,
        'X-TC-Timestamp': timestamp,
        'X-TC-Nonce': nonce
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          if (result.Response && result.Response.SendStatusSet) {
            const status = result.Response.SendStatusSet[0];
            if (status.Code === 'Ok') {
              resolve({ success: true, requestId: result.Response.RequestId });
            } else {
              resolve({ success: false, message: status.Message });
            }
          } else {
            resolve({ success: false, message: '发送失败', error: result });
          }
        } catch (e) {
          resolve({ success: false, message: '解析响应失败', error: e.message });
        }
      });
    });

    req.on('error', (e) => {
      resolve({ success: false, message: '网络错误', error: e.message });
    });

    req.write(requestBody);
    req.end();
  });
}

/**
 * 发送预约确认短信
 * @param {string} phone - 手机号
 * @param {object} data - 预约数据
 */
async function sendAppointmentSms(phone, data) {
  // 短信模板ID需要先在腾讯云控制台创建
  // 模板示例：您的试驾预约已确认，车型：{1}，时间：{2} {3}，门店：{4}，联系电话：{5}。
  const templateId = process.env.SMS_TEMPLATE_APPOINTMENT || '123456'; // 替换为实际模板ID
  
  const params = [
    data.product_name || '新能源车',
    data.preferred_date,
    data.preferred_time,
    data.service_address || '海宝新能源门店',
    data.service_phone || '400-xxx-xxxx'
  ];

  return sendSms(phone, templateId, params);
}

/**
 * 发送预约提醒短信（提前1小时）
 */
async function sendReminderSms(phone, data) {
  const templateId = process.env.SMS_TEMPLATE_REMINDER || '123457';
  
  const params = [
    data.preferred_time,
    data.product_name || '新能源车',
    data.service_address || '海宝新能源门店'
  ];

  return sendSms(phone, templateId, params);
}

/**
 * 发送自定义短信
 */
async function sendCustomSms(phone, content) {
  // 如果有自定义内容模板，使用模板发送
  // 否则使用通知类模板
  const templateId = process.env.SMS_TEMPLATE_CUSTOM || '123458';
  
  return sendSms(phone, templateId, [content.substring(0, 50)]);
}

module.exports = {
  sendSms,
  sendAppointmentSms,
  sendReminderSms,
  sendCustomSms,
  SMS_CONFIG
};

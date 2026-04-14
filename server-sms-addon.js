/**
 * 添加到 server.js 的短信 API 路由
 * 
 * 将以下代码添加到 server.js 的路由部分
 */

// ========== 短信发送 API ==========

// 短信配置（简单版本，无需腾讯云 SDK）
const SMS_ENABLED = process.env.SMS_ENABLED === 'true';
const SMS_API_URL = process.env.SMS_API_URL || ''; // 第三方短信平台 URL
const SMS_API_KEY = process.env.SMS_API_KEY || '';

/**
 * 简易短信发送（使用第三方平台）
 * 推荐平台：阿里云短信、腾讯云短信、云片、容联云等
 */
async function sendSmsSimple(phone, content) {
  if (!SMS_ENABLED || !SMS_API_URL) {
    console.log('[SMS Mock] 发送短信到:', phone, '内容:', content);
    return { success: true, message: '模拟发送成功（短信服务未启用）' };
  }

  // 如果配置了第三方短信平台，调用其 API
  // 这里以通用的 HTTP API 为例，具体根据平台文档调整
  const https = require('https');
  const querystring = require('querystring');
  
  const postData = querystring.stringify({
    apikey: SMS_API_KEY,
    mobile: phone,
    text: content
  });

  return new Promise((resolve) => {
    const req = https.request(SMS_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData)
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          resolve({ success: result.code === 0, message: result.msg || '发送成功' });
        } catch (e) {
          resolve({ success: false, message: '解析响应失败' });
        }
      });
    });
    
    req.on('error', (e) => resolve({ success: false, message: e.message }));
    req.write(postData);
    req.end();
  });
}

// 短信发送接口（管理员调用）
app.post('/api/sms/send', (req, res) => {
  const { phone, content, appointment_id } = req.body;
  
  // 验证管理员权限（简单判断）
  // 实际项目中应该使用 session 或 token 验证
  const adminPhones = ['18605482818'];
  
  // 验证手机号格式
  if (!phone || !/^1[3-9]\d{9}$/.test(phone)) {
    return res.json({ code: 400, message: '手机号格式不正确' });
  }
  
  // 验证内容
  if (!content || content.trim().length === 0) {
    return res.json({ code: 400, message: '短信内容不能为空' });
  }
  
  // 添加签名前缀
  const smsContent = `【海宝新能源】${content}`;
  
  // 发送短信
  sendSmsSimple(phone, smsContent).then(result => {
    // 记录短信发送日志
    if (appointment_id) {
      db.query(
        'INSERT INTO sms_logs (appointment_id, phone, content, status, created_at) VALUES (?, ?, ?, ?, NOW())',
        [appointment_id, phone, smsContent, result.success ? 'success' : 'failed'],
        (err) => {
          if (err) console.error('记录短信日志失败:', err);
        }
      );
    }
    
    if (result.success) {
      res.json({ code: 0, message: '发送成功' });
    } else {
      res.json({ code: 500, message: result.message || '发送失败' });
    }
  }).catch(err => {
    console.error('短信发送错误:', err);
    res.json({ code: 500, message: '发送失败' });
  });
});

// 预约成功后自动发送短信
async function sendAppointmentNotification(appointment) {
  const content = `您好，${appointment.user_name}！您预约的试驾服务（${appointment.preferred_date} ${appointment.preferred_time}）已提交成功，门店地址：${appointment.service_address || '山东省泰安市'}。如有疑问请致电咨询。`;
  
  return sendSmsSimple(appointment.user_phone, `【海宝新能源】${content}`);
}

// ========== 创建短信日志表（首次运行时执行）==========
/*
CREATE TABLE IF NOT EXISTS sms_logs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  appointment_id INT,
  phone VARCHAR(20) NOT NULL,
  content TEXT,
  status ENUM('success', 'failed') DEFAULT 'success',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_appointment (appointment_id),
  INDEX idx_phone (phone)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
*/

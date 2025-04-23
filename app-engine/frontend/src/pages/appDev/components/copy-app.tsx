/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2025 Huawei Technologies Co., Ltd. All rights reserved.
 *  This file is a part of the ModelEngine Project.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import React, { useState, useImperativeHandle } from 'react';
import { Modal, Upload, Form, Input } from 'antd';
import { useTranslation } from 'react-i18next';
import { Message } from '@/shared/utils/message';
import { fileValidate } from '@/shared/utils/common';
import { uploadChatFile, templateCreateAipp } from '@/shared/http/aipp';
import { convertImgPath } from '@/common/util';
import { TENANT_ID } from '@/pages/chatPreview/components/send-editor/common/config';
import serviceConfig from '@/shared/http/httpConfig';
import UploadImg from '@/assets/images/ai/upload2.png';
import UploadOtherImg from '@/assets/images/ai/upload3.png';

/**
 * 复制应用
 *
 * @param copyRef 当前组件的ref.
 * @return {JSX.Element}
 * @constructor
 */

const CopyApp = ({ copyRef, copySuccess }) => {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [open, setOpen] = useState(false);
  const [filePath, setFilePath] = useState('');
  const [imgPath, setImgPath] = useState('');
  const [showImg, setShowImg] = useState(false);
  const [loading, setLoading] = useState(false);
  const [appInfo, setAppInfo] = useState({});
  const { AIPP_URL } = serviceConfig;

  useImperativeHandle(copyRef, () => {
    return {
      openUpload: (appInfo) => dataInit(appInfo),
    };
  });
  // 获取图片
  const getImgPath = async (icon) => {
    const res: any = await convertImgPath(icon);
    setImgPath(res);
  };
  // 初始化数据
  const dataInit = (appInfo) => {
    setAppInfo(appInfo);
    form.setFieldsValue({
      name: appInfo.name,
      icon: appInfo.attributes?.icon,
    });
    if (appInfo.attributes?.icon) {
      getImgPath(appInfo.attributes.icon);
      setFilePath(appInfo.attributes.icon);
    } 
  }
  // 复制应用
  const handleCopyApp = async () => {
    try {
      setLoading(true);
      const formParams = await form.validateFields();
      console.log(appInfo);
    } finally {
      setLoading(false);
    }
  };

  const onChange = ({ file }) => {
    let validateResult = fileValidate(file);
    if (!validateResult) {
      form.setFieldsValue({
        icon: appInfo.attributes?.icon || ''
      })
    }
    validateResult && pictureUpload(file);
  }

  // 上传图片
  const pictureUpload = async (file) => {
    let headers = {
      'attachment-filename': encodeURI(file.name || ''),
      'Content-Type': 'multipart/form-data',
    };
    try {
      const formData = new FormData();
      formData.append('file', file);
      let res: any = await uploadChatFile(TENANT_ID, appInfo.id, formData, headers);
      if (res.code === 0) {
        let path = `${AIPP_URL}/${TENANT_ID}/file?filePath=${res.data.file_path}&fileName=${res.data.file_name}`;
        setFilePath(path);
        convertImgPath(path).then(res => {
          setImgPath(res);
        });
      }
    } catch (err) {
      Message({ type: 'error', content: err.message || t('uploadImageFail') })
    }
  }


  return <>
    <Modal
      title={t('copy')}
      width='526px'
      open={open}
      centered
      onOk={handleCopyApp}
      onCancel={() => setOpen(false)}
      okButtonProps={{ loading }}
      okText={t('create')}
      cancelText={t('cancel')}
      destroyOnClose
      maskClosable={false}
      className='upload-app'
    >
      <div>
        <Form form={form} layout='vertical' autoComplete='off' className='edit-form-content'>
          <Form.Item label={t('icon')} name='icon'>
            <div className='avatar'>
              <Upload
                beforeUpload={() => false}
                onChange={onChange}
                showUploadList={false}
                accept='.jpg,.png,.gif,.jpeg'
              >
                <span className={['upload-img-btn', filePath ? 'upload-img-uploaded' : ''].join(' ')}>
                  {imgPath ? (
                    <img
                      className={showImg ? 'img-send-item' : ''}
                      onLoad={() => setShowImg(true)}
                      src={imgPath}
                    />
                  ) : (
                    <img src={UploadImg} alt='' />
                  )}
                  {showImg && (
                    <span className='upload-img-mask'>
                      <img src={UploadOtherImg} alt='' />
                    </span>
                  )}
                </span>
              </Upload>
            </div>
          </Form.Item>
          <Form.Item
              label={t('name')}
              name='name'
              rules={[
              { required: true, message: t('plsEnter') },
              {
                  type: 'string',
                  max: 64,
                  message: `${t('characterLength')}：1 - 64`,
              },
              ]}
          >
              <Input />
          </Form.Item>
        </Form> 
      </div>
    </Modal>
  </>
};

export default CopyApp;

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2025 Huawei Technologies Co., Ltd. All rights reserved.
 *  This file is a part of the ModelEngine Project.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import React, { useState } from 'react';
import { Upload } from 'antd';
import { useTranslation } from 'react-i18next';
import { Message } from '@/shared/utils/message';
import { fileValidate } from '@/shared/utils/common';
import { uploadChatFile } from '@/shared/http/aipp';
import { convertImgPath } from '@/common/util';
import { TENANT_ID } from '@/pages/chatPreview/components/send-editor/common/config';
import serviceConfig from '@/shared/http/httpConfig';
import UploadImg from '@/assets/images/ai/upload2.png';
import UploadOtherImg from '@/assets/images/ai/upload3.png';
import './index.scoped.scss';

/**
 * 文件上传
 *
 * @param appId 当前应用ID
 * @param uploadSuccess 图片上传成功回调
 * @return {JSX.Element}
 * @constructor
 */

const UploadImg = ({ appId, uploadSuccess }) => {
  const { t } = useTranslation();
  const [filePath, setFilePath] = useState('');
  const [imgPath, setImgPath] = useState('');
  const [showImg, setShowImg] = useState(false);
  const { AIPP_URL } = serviceConfig;

  const onChange = ({ file }) => {
    let validateResult = fileValidate(file);
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
        const path = `${AIPP_URL}/${TENANT_ID}/file?filePath=${res.data.file_path}&fileName=${res.data.file_name}`;
        uploadSuccess(path);
        convertImgPath(path).then(res => {
          showImg(true);
          setImgPath(res);
        });
      }
    } catch (err) {
      Message({ type: 'error', content: err.message || t('uploadImageFail') })
    }
  }


  return <>
    <Upload
      beforeUpload={() => false}
      onChange={onChange}
      showUploadList={false}
      accept='.jpg,.png,.gif,.jpeg'
    >
      <span className={['upload-img-btn', filePath ? 'upload-img-uploaded' : ''].join(' ')}>
        {showImg ? (
          <div>
            <img
              className='img-send-item'
              onLoad={() => setShowImg(true)}
              src={imgPath}
            />
            <span className='upload-img-mask'>
              <img src={UploadOtherImg} alt='' />
            </span>
          </div>
         
        ) : (
          <img src={UploadImg} alt='' />
        )}
      </span>
    </Upload>
  </>
};
export default UploadImg;

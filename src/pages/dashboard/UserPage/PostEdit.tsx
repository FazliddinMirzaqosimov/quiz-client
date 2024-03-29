import { InboxOutlined } from "@ant-design/icons";
import { Form, Input, message, Modal, Select, Spin } from "antd";
import { useEffect, useState } from "react";
import { setLoading, setVisible } from "./ReducerActions";
import { PostEditPropType } from "./Types";
import jwtAxios from "auth/jwt-auth/jwtaxios";
import Dragger from "antd/es/upload/Dragger";
import { JwtUserType, useJWTAuth } from "auth/jwt-auth/JWTAuthAuthProvider";
import { UploadChangeParam, UploadFile } from "antd/es/upload";

function loadImage(photo: any): any {
  return new Promise((resolve) => {
    const reader = new FileReader();
    photo && reader.readAsDataURL(photo);
    reader.onload = () => {
      resolve(reader.result);
    };
  });
}

function PostEdit({ title, state, getItems, dispatch }: PostEditPropType) {
  // STATES
  // console.log(jwtAxios.defaults.headers.common.Authorization);

  const [editItem, setEditItem] = useState<JwtUserType>(null);
  const [form] = Form.useForm();
  //USEEFFECTS

  useEffect(() => {
    form.setFieldsValue(editItem);
  }, [editItem]);

  //FETCH requests
  useEffect(() => {
    form.resetFields();
    if (!state.editItemId) {
      setEditItem(null);
      return;
    }
    dispatch(setLoading({ ...state.loading, modal: true }));

    jwtAxios.get(`/users/${state.editItemId}`).then((res) => {
      dispatch(setLoading({ ...state.loading, modal: false }));

      setEditItem(res.data.data.user);
    });
  }, [state.editItemId]);

  const postItem = (data: JwtUserType & { photo: any }) => {
    const formData: FormData = new FormData();

    data?.password && formData.append("password", data?.password);
    data.photo?.file && formData.append("photo", data.photo.file);
    console.log([...formData]);

    dispatch(setLoading({ ...state.loading, modal: true }));
    jwtAxios[editItem?._id ? "patch" : "post"](
      `/users/${editItem?._id || ""}`,
      formData
    )
      .finally(() => {
        dispatch(setLoading({ ...state.loading, modal: false }));
      })
      .then(() => {
        message.success("Succesfuly posted", 2);
        if (!editItem?._id) {
          form.resetFields();
        }
        dispatch(setVisible(false));
        getItems();
      })
      .catch((err: any) => {
        console.log(err);

        message.error(err.response?.data?.error || err.message, 3);
      });
  };

  // Handlers
  const handleSubmit = () => {
    postItem(form.getFieldsValue());
  };

  //UPLOAD DRAGGER FUNCTIONS
  const handleChange = (info: UploadChangeParam<UploadFile<any>>) => {
    info.file.status = "done";
  };

  return (
    <Modal
      onCancel={() => {
        dispatch(setVisible(false));
      }}
      onOk={form.submit}
      okText={"OK"}
      visible={state.visible}
      style={{ top: 50 }}
      title={title}
      width={600}
    >
      <Spin spinning={state.loading.modal}>
        <Form
          form={form}
          onFinish={handleSubmit}
          labelCol={{ span: 5 }}
          initialValues={{
            role: "user",
          }}
        >
          <Form.Item
            name="email"
            label={"Email"}
            rules={[
              {
                required: true,
                message: "you need to provide email",
              },
            ]}
            hasFeedback
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="name"
            label={"Name"}
            rules={[
              {
                required: true,
                message: "You need to provide name",
              },
            ]}
            hasFeedback
          >
            <Input />
          </Form.Item>
          {!state.editItemId ? (
            <Form.Item
              name="password"
              label={"Password"}
              rules={[
                {
                  required: true,
                  message: "You need to provide password",
                },
              ]}
              hasFeedback
            >
              <Input />
            </Form.Item>
          ) : (
            ""
          )}
          <Form.Item name="role" label={"Role"} hasFeedback>
            <Select
              options={[
                { value: "admin", label: "Admin" },
                { value: "user", label: "User" },
              ]}
            />
          </Form.Item>
          <Form.Item name="photo">
            <Dragger
              beforeUpload={() => false}
              onChange={handleChange}
              multiple={false}
              listType="picture"
              maxCount={1}
              accept="image/png, image/jpeg, image/jfif, image/svg"
            >
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-text">
                Click or drag file to this area to upload
              </p>
              <p className="ant-upload-hint">
                Support for a single or bulk upload. Strictly prohibit from
                uploading company data or other band files
              </p>
            </Dragger>
          </Form.Item>
        </Form>
      </Spin>
    </Modal>
  );
}

export default PostEdit;

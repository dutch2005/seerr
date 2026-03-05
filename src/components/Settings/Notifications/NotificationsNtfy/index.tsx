import Button from '@app/components/Common/Button';
import LoadingSpinner from '@app/components/Common/LoadingSpinner';
import SensitiveInput from '@app/components/Common/SensitiveInput';
import NotificationTypeSelector from '@app/components/NotificationTypeSelector';
import globalMessages from '@app/i18n/globalMessages';
import defineMessages from '@app/utils/defineMessages';
import { isValidURL } from '@app/utils/urlValidationHelper';
import { ArrowDownOnSquareIcon, BeakerIcon } from '@heroicons/react/24/outline';
import type { NotificationAgentNtfy } from '@server/lib/settings';
import axios from 'axios';
import { Field, Form, Formik } from 'formik';
import { useState } from 'react';
import { useIntl } from 'react-intl';
import { useToasts } from 'react-toast-notifications';
import useSWR from 'swr';
import * as Yup from 'yup';

const messages = defineMessages('components.Settings.Notifications.NotificationsNtfy', {
  agentenabled: 'Enable Agent',
  embedPoster: 'Embed Poster',
  url: 'Url',
  topic: 'Topic',
  priority: 'Priority',
  priorityTip: 'Set the priority for ntfy notifications.',
  markdown: 'Markdown Support',
  markdownTip: 'Enable Markdown rendering for ntfy notifications',
  authMethodUsernamePassword: 'Username/Password authentication',
  username: 'Username',
  password: 'Password',
  tokenAuth: 'Token authentication',
  token: 'Token',
  ntfysettingssaved: 'Ntfy notification settings saved successfully!',
  ntfysettingsfailed: 'Ntfy notification settings failed to save.',
  toastNtfyTestSending: 'Sending ntfy test notification…',
  toastNtfyTestSuccess: 'Ntfy test notification sent!',
  toastNtfyTestFailed: 'Ntfy test notification failed to send.',
  validationNtfyUrl: 'You must provide a valid URL',
  validationNtfyTopic: 'You must provide a topic',
});

const NotificationsNtfySchema = Yup.object().shape({
  url: Yup.string()
    .required(globalMessages.validationNtfyUrl)
    .test('is-url', globalMessages.validationNtfyUrl, (v) => isValidURL(v)),
  topic: Yup.string().required(globalMessages.validationNtfyTopic),
  priority: Yup.number().integer().min(0).max(5),
  markdown: Yup.boolean(),
});

const NotificationsNtfy = () => {
  const intl = useIntl();
  const { addToast, removeToast } = useToasts();
  const [isTesting, setIsTesting] = useState(false);

  const { data, error, mutate } = useSWR<NotificationAgentNtfy>(
    '/api/v1/settings/notifications/ntfy'
  );

  if (!data && !error) {
    return <LoadingSpinner />;
  }

  return (
    <Formik
      enableReinitialize
      initialValues={{
        enabled: data?.enabled,
        embedPoster: data?.embedPoster,
        types: data?.types,
        url: data?.options.url,
        topic: data?.options.topic,
        authMethodUsernamePassword: data?.options.authMethodUsernamePassword,
        username: data?.options.username,
        password: data?.options.password,
        authMethodToken: data?.options.authMethodToken,
        token: data?.options.token,
        priority: data?.options.priority,
        markdown: data?.options.markdown,
      }}
      validationSchema={NotificationsNtfySchema}
      onSubmit={async (values) => {
        try {
          await axios.post('/api/v1/settings/notifications/ntfy', {
            enabled: values.enabled,
            embedPoster: values.embedPoster,
            types: values.types,
            options: {
              url: values.url,
              topic: values.topic,
              authMethodUsernamePassword: values.authMethodUsernamePassword,
              username: values.username,
              password: values.password,
              authMethodToken: values.authMethodToken,
              token: values.token,
              priority: values.priority,
              markdown: values.markdown,
            },
          });

          addToast(intl.formatMessage(messages.ntfysettingssaved), {
            appearance: 'success',
            autoDismiss: true,
          });
          mutate();
        } catch (e) {
          addToast(intl.formatMessage(messages.ntfysettingsfailed), {
            appearance: 'error',
            autoDismiss: true,
          });
        }
      }}
    >
      {({ values, errors, touched, setFieldValue, isSubmitting }) => {
        const testSettings = async () => {
          setIsTesting(true);
          let toastId: string | undefined;
          try {
            addToast(intl.formatMessage(messages.toastNtfyTestSending), {
              appearance: 'info',
              autoDismiss: false,
              onDismiss: (id) => (toastId = id),
            });

            await axios.post('/api/v1/settings/notifications/ntfy/test', {
              enabled: values.enabled,
              types: values.types,
              options: {
                url: values.url,
                topic: values.topic,
                authMethodUsernamePassword: values.authMethodUsernamePassword,
                username: values.username,
                password: values.password,
                authMethodToken: values.authMethodToken,
                token: values.token,
                priority: values.priority,
                markdown: values.markdown,
              },
            });

            if (toastId) {
              removeToast(toastId);
            }
            addToast(intl.formatMessage(messages.toastNtfyTestSuccess), {
              appearance: 'success',
              autoDismiss: true,
            });
          } catch (e) {
            if (toastId) {
              removeToast(toastId);
            }
            addToast(intl.formatMessage(messages.toastNtfyTestFailed), {
              appearance: 'error',
              autoDismiss: true,
            });
          } finally {
            setIsTesting(false);
          }
        };

        return (
          <Form className="section">
            <div className="form-row">
              <label htmlFor="enabled" className="checkbox-label">
                {intl.formatMessage(messages.agentenabled)}
              </label>
              <div className="form-input-area">
                <Field type="checkbox" id="enabled" name="enabled" />
              </div>
            </div>
            <div className="form-row">
              <label htmlFor="types" className="text-label">
                {intl.formatMessage(globalMessages.notificationtypes)}
              </label>
              <div className="form-input-area">
                <NotificationTypeSelector
                  currentTypes={values.types}
                  onUpdate={(newTypes) => setFieldValue('types', newTypes)}
                />
              </div>
            </div>
            <div className="form-row">
              <label htmlFor="embedPoster" className="checkbox-label">
                {intl.formatMessage(messages.embedPoster)}
              </label>
              <div className="form-input-area">
                <Field type="checkbox" id="embedPoster" name="embedPoster" />
              </div>
            </div>
            <div className="form-row">
              <label htmlFor="priority" className="text-label">
                {intl.formatMessage(messages.priority)}
                <span className="label-tip">
                  {intl.formatMessage(messages.priorityTip)}
                </span>
              </label>
              <div className="form-input-area">
                <Field
                  type="number"
                  id="priority"
                  name="priority"
                  className="short"
                />
              </div>
            </div>
            <div className="form-row">
              <label htmlFor="markdown" className="checkbox-label">
                <span className="mr-2">
                  {intl.formatMessage(messages.markdown)}
                </span>
              </label>
              <div className="form-input-area">
                <Field type="checkbox" id="markdown" name="markdown" />
                <span className="ml-2 text-sm text-gray-500">
                  {intl.formatMessage(messages.markdownTip)}
                </span>
              </div>
            </div>
            <div className="form-row">
              <label htmlFor="url" className="text-label">
                {intl.formatMessage(messages.url)}
                <span className="label-required">*</span>
              </label>
              <div className="form-input-area">
                <div className="form-combined-field">
                  <Field
                    type="text"
                    id="url"
                    name="url"
                    placeholder="https://ntfy.sh"
                  />
                </div>
                {errors.url && touched.url && (
                  <div className="error">{errors.url}</div>
                )}
              </div>
            </div>
            <div className="form-row">
              <label htmlFor="topic" className="text-label">
                {intl.formatMessage(messages.topic)}
                <span className="label-required">*</span>
              </label>
              <div className="form-input-area">
                <div className="form-combined-field">
                  <Field type="text" id="topic" name="topic" />
                </div>
                {errors.topic && touched.topic && (
                  <div className="error">{errors.topic}</div>
                )}
              </div>
            </div>
            <div className="form-row">
              <label
                htmlFor="authMethodUsernamePassword"
                className="checkbox-label"
              >
                {intl.formatMessage(messages.authMethodUsernamePassword)}
              </label>
              <div className="form-input-area">
                <Field
                  type="checkbox"
                  id="authMethodUsernamePassword"
                  name="authMethodUsernamePassword"
                />
              </div>
            </div>
            {values.authMethodUsernamePassword && (
              <>
                <div className="form-row">
                  <label htmlFor="username" className="text-label">
                    {intl.formatMessage(messages.username)}
                  </label>
                  <div className="form-input-area">
                    <div className="form-combined-field">
                      <Field type="text" id="username" name="username" />
                    </div>
                  </div>
                </div>
                <div className="form-row">
                  <label htmlFor="password" className="text-label">
                    {intl.formatMessage(messages.password)}
                  </label>
                  <div className="form-input-area">
                    <div className="form-combined-field">
                      <SensitiveInput
                        as="field"
                        type="password"
                        id="password"
                        name="password"
                      />
                    </div>
                  </div>
                </div>
              </>
            )}
            <div className="form-row">
              <label htmlFor="authMethodToken" className="checkbox-label">
                {intl.formatMessage(messages.tokenAuth)}
              </label>
              <div className="form-input-area">
                <Field
                  type="checkbox"
                  id="authMethodToken"
                  name="authMethodToken"
                />
              </div>
            </div>
            {values.authMethodToken && (
              <div className="form-row">
                <label htmlFor="token" className="text-label">
                  {intl.formatMessage(messages.token)}
                </label>
                <div className="form-input-area">
                  <div className="form-combined-field">
                    <SensitiveInput
                      as="field"
                      type="password"
                      id="token"
                      name="token"
                    />
                  </div>
                </div>
              </div>
            )}
            <div className="actions">
              <div className="flex justify-end">
                <span className="ml-3 inline-flex rounded-md shadow-sm">
                  <Button
                    buttonType="warning"
                    disabled={isSubmitting || isTesting}
                    onClick={(e) => {
                      e.preventDefault();
                      testSettings();
                    }}
                  >
                    <BeakerIcon />
                    <span>{intl.formatMessage(globalMessages.test)}</span>
                  </Button>
                </span>
                <span className="ml-3 inline-flex rounded-md shadow-sm">
                  <Button
                    buttonType="primary"
                    type="submit"
                    disabled={isSubmitting || isTesting}
                  >
                    <ArrowDownOnSquareIcon />
                    <span>
                      {isSubmitting
                        ? intl.formatMessage(globalMessages.saving)
                        : intl.formatMessage(globalMessages.save)}
                    </span>
                  </Button>
                </span>
              </div>
            </div>
          </Form>
        );
      }}
    </Formik>
  );
};

export default NotificationsNtfy;

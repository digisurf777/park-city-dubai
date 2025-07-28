import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';
import { ReactNode } from 'react';

interface ReCaptchaProviderProps {
  children: ReactNode;
}

const ReCaptchaProvider = ({ children }: ReCaptchaProviderProps) => {
  return (
    <GoogleReCaptchaProvider 
      reCaptchaKey="6LduLpIrAAAAADwcAv1FqqGD3U8mAIXeOaR9g_bc"
      scriptProps={{
        async: false,
        defer: false,
        appendTo: "head",
        nonce: undefined,
      }}
    >
      {children}
    </GoogleReCaptchaProvider>
  );
};

export default ReCaptchaProvider;
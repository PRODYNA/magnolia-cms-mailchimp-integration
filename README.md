# magnolia-cms-mailchimp-integration
A magnolia cms light module to integrate with mailchimp.

The `mailchimp-connector` directory is a light module that you can use in your project.

The module requires Magnolia DXCore. Tested on Magnolia 6.2.17.

---

## Features

* A Mailchimp List Resource `REST Client` is configured.
* A signup form component is configured that can be used to embed signup forms from your Mailchimp lists on your pages.

## Setup

_A Mailchimp account with an active API key is required for this integration. For configuration of the Mailchimp account and generation of the API key refer to [Mailchimp Documentation](https://mailchimp.com/developer/marketing/guides/quick-start/#create-an-account)._

* Download and install the light module in a DXCore instance.

The module requires the following parameters configured as environmental variables available to your server:
| Description  | Key | Sample Value  |
|---|---|---|
| [Mailchimp Server Prefix](https://mailchimp.com/developer/marketing/guides/quick-start/#make-your-first-api-call) | MAILCHIMP_SERVER_PREFIX  |  us10 |
| Mailchimp Username. Any applicable value is acceptable. Use a custom value to distinguish between installations and/or assist during potential error tracking/troubleshooting when contacting Mailchimp support. | MAILCHIMP_USERNAME | public-1 |
| The API key provided by Mailchimp. | MAILCHIMP_API_KEY  | 0128901f0adc-us10 |

# Signup Form Component 

Import the component to your pages by using a custom decorator.

```
# /your-module/mailchimp-connector/templates/pages/your-page.yaml
areas:
  main:
    availableComponents
      mailchimpForm:
        id: mailchimp-connector:components/signupForm/signupForm
```

![Usage in signup form component](/_dev/add-component.jpg "Add Signup Form Component")
![Usage in signup form component](/_dev/select-audience.jpg "Select audience destination")
![Usage in signup form component](/_dev/form-component.jpg "Signup Form Component")

_Tip: To modify the look & feel of your subscribe forms login to your Mailchimp account, navigate to Audiences and click on Signup Forms menu item._
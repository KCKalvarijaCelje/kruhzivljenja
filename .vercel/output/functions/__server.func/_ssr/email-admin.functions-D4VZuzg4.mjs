import { c as createSsrRpc } from "./createSsrRpc-Bob-CuPr.mjs";
import { r as requireSupabaseAuth } from "./tz-CU05rO0J.mjs";
import { c as createServerFn } from "./server-Dm1gvL4M.mjs";
const getEmailAdminData = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => input).handler(createSsrRpc("82c0ee8c4890a637a8e70cfeedc1bc4807bd0ffec4d9b3e6978cbfb1d610bceb"));
const triggerDriverNotification = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => input).handler(createSsrRpc("519033afadf2e4612e5370bce8e17adf8842c83aac1cb40203e34a76f74f15cc"));
const previewDriverEmail = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => input).handler(createSsrRpc("8b5d3c8314e8e50ea15bc9fb04051cd12668a9510788b10bb27900fedbe6d6f8"));
const sendTestEmailToSelf = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("bd365cffad0b2b6203910bb6d844390cae85978de0a84bf49cb2d1afcf99761b"));
const getSendLogStatus = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => input).handler(createSsrRpc("03952d2e135664fc5783b13790783f65f966469b7f87a4c3beb2e1b0917c8e27"));
const listUpcomingAssignedStops = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("d0cd04d307559cf8107c653f180c8e630f051cfab024833e3de9755be96e439a"));
const listEmailTemplatesAdmin = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("c2aa2934fe316a7e7524d6a635964dc6e643f2e93e3e504fd7f47985844de9ec"));
const upsertEmailTemplateAdmin = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => input).handler(createSsrRpc("905a7fa2bcbb08cd1f889b08a1804e7a129911ab37e73a75461e30dbea92f71b"));
const resetEmailTemplateAdmin = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => input).handler(createSsrRpc("4bd5fc2d4c66cf9d4831cc70f718c6c060f572f9f23499347ae9202696c6a619"));
const getEmailBrandSettings = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("811d39a3377610a6245710ecb21a2b124447d8bf1de2bf6a07b6d06fe620270e"));
const upsertEmailBrandSettings = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => input).handler(createSsrRpc("e639113f3ab53b872c611c31ccf27f25080233f151f23d303e7b389893d6bedc"));
const previewTemplateWithSample = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => input).handler(createSsrRpc("05cc936511c0bd4b0347673bf1c590111844aa7b0d9959fd1d8227b1d22d0f24"));
export {
  upsertEmailTemplateAdmin as a,
  getEmailAdminData as b,
  listUpcomingAssignedStops as c,
  previewDriverEmail as d,
  getSendLogStatus as e,
  getEmailBrandSettings as g,
  listEmailTemplatesAdmin as l,
  previewTemplateWithSample as p,
  resetEmailTemplateAdmin as r,
  sendTestEmailToSelf as s,
  triggerDriverNotification as t,
  upsertEmailBrandSettings as u
};

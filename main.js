const express = require('express')
const axios = require('axios')
const app = express()
const port = process.env.PORT || 5000
const config = require('./config.json')
const azure_id = config.azure_id
const azure_secret = config.azure_secret
const azure_redirect = config.azure_redirect
const azure_refresh = config.azure_refresh

app.get('/', (req, res) => {
  res.send("Authentication for Blowaunch! We do not log tokens or any other personal information.");
})

app.get('/microsoft', (req, res) => {
  res.send("Authentication for Blowaunch! Root for Microsoft authentication.");
})

app.get('/xbox', (req, res) => {
  res.send("Authentication for Blowaunch! Root for XBOX Live authentication.");
})

app.get('/minecraft', (req, res) => {
  res.send("Authentication for Blowaunch! Root for Minecraft authentication.");
})

app.get('/mojang', (req, res) => {
  res.send("Authentication for Blowaunch! Root for Mojang authentication.");
})

app.get('/mojang/login', (req, res) => {
  let username = req.query.username
  let password = req.query.password
  axios.post(`https://authserver.mojang.com/authenticate`, {
    "agent": {
        "name": "Minecraft",
        "version": 1
    },
    "username": username,
    "password": password,
    "clientToken": "blowaunch"
  }, {
    headers: {
        "Content-Type": "application/json",
        "Upgrade-Insecure-Requests": "1",
        "Cache-Control": "max-age=0",
        "Connection": "keep-alive"
    }
  })
  .then(resb => { res.json(resb.data) })
  .catch(error => { res.send("auth-error") })
})

app.get('/mojang/refresh', (req, res) => {
  let token = req.query.token
  let name = req.query.name
  let id = req.query.id
  axios.post(`https://authserver.mojang.com/refresh`, {
    "accessToken": token,
    "clientToken": "blowaunch",
    "selectedProfile": {
        "name": name,
        "id": id
    }
  }, {
    headers: {
        "Content-Type": "application/json",
        "Upgrade-Insecure-Requests": "1",
        "Cache-Control": "max-age=0",
        "Connection": "keep-alive"
    }
  })
  .then(resb => { res.json(resb.data) })
  .catch(error => { res.send("auth-error") })
})

app.get('/mojang/validate', (req, res) => {
  let token = req.query.token
  axios.post(`https://authserver.mojang.com/validate`, {
    "accessToken": token,
    "clientToken": "blowaunch",
    "selectedProfile": {
        "name": name,
        "id": id
    }
  }, {
    headers: {
        "Content-Type": "application/json",
        "Upgrade-Insecure-Requests": "1",
        "Cache-Control": "max-age=0",
        "Connection": "keep-alive"
    }
  })
  .then(resb => { res.json("token-valid") })
  .catch(error => { res.send("token-invalid") })
})

app.get('/mojang/invalidate', (req, res) => {
  let token = req.query.token
  axios.post(`https://authserver.mojang.com/invalidate`, {
    "accessToken": token,
    "clientToken": "blowaunch"
  }, {
    headers: {
        "Content-Type": "application/json",
        "Upgrade-Insecure-Requests": "1",
        "Cache-Control": "max-age=0",
        "Connection": "keep-alive"
    }
  })
  .then(resb => { res.json("success") })
  .catch(error => { res.send("error") })
})

app.get('/microsoft/login', (req, res) => {
  res.redirect(`https://login.live.com/oauth20_authorize.srf?client_id=${azure_id}&response_type=code&redirect_uri=${azure_redirect}&scope=XboxLive.signin%20offline_access`)
})

app.get('/microsoft/token', (req, res) => {
  let code = req.query.code
  let params = new URLSearchParams();
  params.append('client_id', azure_id);
  params.append('client_secret', azure_secret);
  params.append('code', code);
  params.append('grant_type', 'authorization_code');
  params.append('redirect_uri', azure_redirect);
  axios.post(`https://login.live.com/oauth20_token.srf`, params, {
    headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Upgrade-Insecure-Requests": "1",
        "Cache-Control": "max-age=0",
        "Connection": "keep-alive"
    }
  })
  .then(resb => { res.json(resb.data) })
  .catch(error => { res.send("auth-error") })
})

app.get('/microsoft/refresh', (req, res) => {
  let token = req.query.token
  let params = new URLSearchParams();
  params.append('client_id', azure_id);
  params.append('client_secret', azure_secret);
  params.append('refresh_token', token);
  params.append('grant_type', 'refresh_token');
  params.append('redirect_uri', azure_refresh);
  axios.post(`https://login.live.com/oauth20_token.srf`, params, {
    headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Upgrade-Insecure-Requests": "1",
        "Cache-Control": "max-age=0",
        "Connection": "keep-alive"
    }
  })
  .then(resb => { res.json(resb.data) })
  .catch(error => { res.send("auth-error") })
})

app.get('/xbox/login', (req, res) => {
  let token = req.query.token
  axios.post(`https://user.auth.xboxlive.com/user/authenticate`, {
    "Properties": {
        "AuthMethod": "RPS",
        "SiteName": "user.auth.xboxlive.com",
        "RpsTicket": `d=${token}`
    },
    "RelyingParty": "http://auth.xboxlive.com",
    "TokenType": "JWT"
  }, {
    headers: {
        "Content-Type": "application/json",
        "Upgrade-Insecure-Requests": "1",
        "Cache-Control": "max-age=0",
        "Connection": "keep-alive"
    }
  })
  .then(resb => { res.json(resb.data) })
  .catch(error => { res.send("auth-error") })
})

app.get('/xbox/xsts', (req, res) => {
  let token = req.query.token
  let userhash = req.query.userhash
  axios.post(`https://xsts.auth.xboxlive.com/xsts/authorize`, {
    "Properties": {
        "SandboxId": "RETAIL",
        "UserTokens": [ token ]
    },
    "RelyingParty": "rp://api.minecraftservices.com/",
    "TokenType": "JWT"
  }, {
    headers: {
        "Content-Type": "application/json",
        "Upgrade-Insecure-Requests": "1",
        "Cache-Control": "max-age=0",
        "Connection": "keep-alive"
    }
  })
  .then(resb => {
    if (resb.data.DisplayClaims.xui[0].uhs != userhash) {
        res.send("userhash-unmatch");
        return;
    }
    if (resb.data.XErr == 2148916233) {
        res.send("no-xbox");
        return;
    }
    if (resb.data.XErr == 2148916235) {
        res.send("xbox-unavailable");
        return;
    }
    if (resb.data.XErr == 2148916238) {
        res.send("is-child");
        return;
    }
    if (resb.data.Xerr != undefined) {
        res.send("unknown-error");
        return;
    }
    res.json(resb.data)
  })
  .catch(error => { res.send("auth-error") })
})

app.get('/minecraft/login', (req, res) => {
  let token = req.query.token
  let userhash = req.query.userhash
  axios.post(`https://api.minecraftservices.com/authentication/login_with_xbox`, {
    "identityToken": `XBL3.0 x=${userhash};${token}`
  }, {
    headers: {
        "Content-Type": "application/json",
        "Upgrade-Insecure-Requests": "1",
        "Cache-Control": "max-age=0",
        "Connection": "keep-alive"
    }
  })
  .then(resb => { res.json(resb.data) })
  .catch(error => { res.send("Error occured while authenticating") })
})

app.get('/minecraft/ownership', (req, res) => {
  let token = req.query.token
  axios.get(`https://api.minecraftservices.com/entitlements/mcstore`, {
    headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
        "Upgrade-Insecure-Requests": "1",
        "Cache-Control": "max-age=0",
        "Connection": "keep-alive"
    }
  })
  .then(resb => {
      if (resb.data.items.length == 0) res.send("not-purchased")
      else res.send("ownership-confirmed")
  })
  .catch(error => { res.send("auth-error") })
})

app.get('/minecraft/profile', (req, res) => {
  let token = req.query.token
  axios.get(`https://api.minecraftservices.com/minecraft/profile`, {
    headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
        "Upgrade-Insecure-Requests": "1",
        "Cache-Control": "max-age=0",
        "Connection": "keep-alive"
    }
  })
  .then(resb => { res.json(resb.data) })
  .catch(error => { res.send("auth-error") })
})

app.listen(port, () => {
  console.log(`Listening at ${port}`)
})

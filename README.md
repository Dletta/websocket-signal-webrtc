## WebSocket Signaling Server for WebRTC

A simple web socket server to allow for signaling across the web for webRTC clients.

I won't take credit for the main server code. It is mostly following the examples of the web socket node module and a basic static http service.

Following items are specific to my implementation:

- Lots of comments to explain whats going on.
- JSON data exchange format with 4 events:
 1. Direct: Used to send data to a specific peer (needed for sdp and candidate exchange)
 2. Broadcast: Used to send data to all peers
 3. Handshake: To update the PID in the server connection (the server will request a handshake upon connection to make sure the pid is saved before sharing it with others)
 4. peerList: A manual way to check who else is connected (mainly for debug not currently used in index.html)
- A simple static website for debug of connections, which some data outputs and an example of how to establish a mesh via webRTC. This can be the flatbed for all sorts of distributed applications, like private chats, video/audio conferences et. al.

### Security and Status

I have not added any special security to this. According to webRTC Signaling Servers don't have to be encrypted, as offer/answer exchange ensures no MITM attacks can occur over the server.

Once DataChannels are established, the webRTC connections are direct between peers and webRTC DTLS encrypts data between the peers. More could be done on the client side to encrypt before sending data across, such as a PubKey encryption system etc, but I will leave that to the developer to come up with.

I am currently testing this for production.
Roadmap 2021:
-[ ] Setup for Heroku Hosting (env vars etc)
-[ ] Run in Production for https://us.meething.space as a data exchange system (e.g. chat)

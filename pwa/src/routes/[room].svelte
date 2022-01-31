<script>
  import io from "socket.io-client";
  import { onMount } from "svelte";
  import { page } from "$app/stores";

  const log = (s) => console.log(s);

  let online_element;
  let loading_screen;

  let host = "loading...";
  let name = "loading...";
  let room_name = "loading...";

  let members_list = [];
  let messages = [];

  let firstTime = true;
  onMount(() => {
    const room = JSON.parse(localStorage.rooms)[$page.params.room];
    room_name = room.name;
    host = room.url;
    name = JSON.parse(localStorage.username);
    log(host + " " + name);

    setTimeout(() => {
      if (!firstTime) return;
      console.error("could not connect to the server.");
    }, 15000);

    globalThis.socket = io(host);
    socket.on("connect", () => {
      socket.emit("join", { name });
    });
    socket.on("join", ({ name, members, msgs }) => {
      members = Object.values(members);
      if (firstTime) {
        firstTime = false;
        members_list = members;
        messages = msgs;
        loading_screen.style.display = "none";
        setTimeout(autoscroll, 300);
      } else {
        members_list.push(name);
        members_list = members_list;
        message({ system: true, text: `${name} joined the room.` });
      }
    });
    socket.on("msg", ({ msg }) => {
      message(msg);
      autoscroll();
    });
    socket.on("leave", ({ name }) => {
      const index = members_list.indexOf(name);
      if (index > -1) {
        members_list.splice(index, 1);
      }
      members_list = members_list;
      message({ system: true, text: `${name} left the room.` });
    });

    function autoscroll() {
      if (online_element) {
        online_element.scrollIntoView();
      }
    }
    function message(msg) {
      messages.push(msg);
      messages = messages;
    }
  });
  function handleInput({ srcElement }) {
    const text = srcElement.value;
    srcElement.value = "";
    if (!text) return;
    globalThis.socket.emit("msg", { name, text });
  }
  function back() {
    location = "/"
  }
</script>

<main>
  <div id="topbar">
    <button on:click={back}> &lt</button> |
    {room_name} |
    {members_list.length} |
    {members_list.join(",")}
  </div>
  <section>
    {#each messages as msg}
      {#if msg.system}
        <div class="row system"><p>{msg.text}</p></div>
      {:else}
        <div class="row {msg.name == name ? 'self' : ''}">
          <div class="msg">
            <strong>{msg.name}</strong> <br />
            {msg.text}
          </div>
        </div>
      {/if}
    {/each}
    <br />
    <br />
    <p bind:this={online_element} />
  </section>
  <input autofocus type="text" on:change={handleInput} />
</main>

<main bind:this={loading_screen} id="loading-screen">
  <p>connecting...<br />{host}</p>
</main>

<style lang="scss">
  @mixin padding($n) {
    padding-left: $n;
    padding-right: $n;
  }
  main {
    @include fullscreen;
    @include noto;
    @include absolute;
    @include flex(column);

    justify-content: space-around;
    align-items: center;
    background-color: $dark-pri;
    color: $light-pri;

    overflow-x: scroll;
    white-space: nowrap;
  }
  #topbar {
    @include section(fit-content, 85vw);
    @include shadow;
    background-color: $dark-sec;
    padding: 10px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  #loading-screen {
    @include flex-center;
  }
  section {
    @include section(80vh, 95vw);
    @include flex(column);

    justify-content: top;
    align-items: center;
    gap: 10px;
    overflow-x: scroll;
    white-space: nowrap;
  }
  .row {
    @include section(fit-content, 100%);
    @include flex(row);
    align-items: center;
    justify-content: right;
  }
  .system {
    justify-content: center;
    color: $dark-tri;
  }
  .self {
    justify-content: left;
  }
  .msg {
    @include section(fit-content, fit-content);
    @include shadow;
    padding: 15px;

    word-wrap: break-word;
    white-space: pre-wrap;
    word-break: break-word;

    border-radius: 10px;
    min-width: 100px;
    max-width: 80vw;
    background-color: $dark-sec;
  }
  strong {
    border-bottom: 1px solid $dark-tri;
  }
  input {
    @include section(6vh, 85vw);
    @include shadow;
    @include padding(10px);
    @include noto;

    outline: none;
    background-color: $dark-sec;
    color: $light-pri;
    border: none;
  }
  button {
  @include shadow;
    outline: none;
    border:none;
    background:transparent;
    color: $light-pri;
    font-size: 18px;
    cursor: pointer;

    &:hover {
      color: $hl;
    }
  }
</style>

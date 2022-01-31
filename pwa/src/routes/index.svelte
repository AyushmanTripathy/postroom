<script>
  import { onMount } from "svelte";
  const log = (s) => console.log(s);

  let form;
  let rooms = [];
  let username = "username";
  let mounted = false;

  onMount(() => {
    mounted = true;
    username = getFromLocalStorage("username", username);
    rooms = getFromLocalStorage("rooms", rooms);

    function getFromLocalStorage(id, def) {
      let temp = localStorage[id];
      if (!temp) {
        localStorage.setItem(id, JSON.stringify(def));
        return def;
      }
      return JSON.parse(temp);
    }
    globalThis.saveToLocalStorage = (id, data) => {
      localStorage.setItem(id, JSON.stringify(data));
    };
  });
  function removeRoom({ srcElement }) {
    const index = srcElement.id;
    rooms.splice(index, 1);
    rooms = rooms;
    globalThis.saveToLocalStorage("rooms", rooms);
  }
  function addRoom() {
    const room = {
      name: form.children[0].value,
      url: form.children[1].value,
    };
    rooms.push(room);
    rooms = rooms;
    globalThis.saveToLocalStorage("rooms", rooms);
  }
  function changeUserName({ srcElement }) {
    username = srcElement.value;
    globalThis.saveToLocalStorage("username", username);
  }
  function joinRoom({ srcElement }) {
    location = "/"+ srcElement.id;
  }
</script>

<main>
  <input
    type="text"
    value={username}
    on:input={changeUserName}
    placeholder="user name"
  />
  <section id="rooms">
    {#each rooms as room, i}
      <div>
        <h2 id={i} on:click={joinRoom}>
          {room.name}
          <button id={i} on:click={removeRoom}> - </button>
        </h2>
        {room.url}
      </div>
    {/each}
    <form bind:this={form} on:submit|preventDefault={addRoom}>
      <input required type="text" placeholder="Name" />
      <input required type="text" placeholder="Link" />
      <input type="submit" value="+" />
    </form>
  </section>
</main>

<style lang="scss">
  main {
    $padding: 15px;
    @include section(fit-content, calc(100vw - $padding * 2));
    @include absolute;
    @include flex(column);
    @include noto;

    gap: 10px;
    background-color: $dark-pri;
    color: $light-pri;
    min-height: calc(100vh - $padding * 2);
    padding: $padding;
    justify-content: center;
    align-items: center;
  }
  h2 {
    color: $light-pri;
    cursor:pointer;
  }
  div {
    color: $dark-tri;
    font-size: 15px;
  }
  button,
  input[type="submit"] {
    @include noto;
    background: transparent;
    border: none;
    color: $light-pri;
    font-size: 20px;
    cursor: pointer;

    &:hover {
      color: $hl;
    }
  }
  input {
    @include noto;
    background: transparent;
    outline: none;
    border: none;
    color: $light-pri;
    border-bottom: 1px solid $dark-tri;
  }
</style>

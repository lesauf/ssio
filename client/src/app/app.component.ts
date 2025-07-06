import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { io, Manager } from 'socket.io-client';

@Component({
    selector: 'app-root',
    imports: [RouterOutlet],
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  @ViewChild('terminal', { static: true })
  container: ElementRef<HTMLDivElement>;

  terminal: Terminal = new Terminal({
    cursorBlink: true,
    fontSize: 16,
    theme: {
      selection: "#ffffff",
    },
  });

  socket: any;
  terminalCols: number;
  terminalRows: number;

  ngOnInit(): void {
    this.socket = io('http://localhost:3000');

    this.terminal.open(this.container.nativeElement);

    this.calculateTerminalSize();

    // you shouldn't register event handlers in the connect handler
    // itself, as a new handler will be registered every time the Socket
    // reconnects
    this.socket.on('connect', () => {
      console.log('Socket connected');

      // Resizing term
      this.terminal.resize(this.terminalCols, this.terminalRows); //  The most import code

      // Useful, so that a second prompt does not appear
      this.terminal.reset();
    });

    // Backend -> Browser
    this.socket.on('data', (data: any) => {
      this.terminal.write(data);
    });

    this.socket.off('data', (data: any) => {
      console.log('Listening off DATA');
    });

    this.socket.on('disconnect', (reason: string) => {

      console.log('Socket disconnected', reason);
      // this.socket.removeAllListeners();
    });

    // Browser -> Backend
    this.terminal.onData((data: any) => {
      this.socket.emit('input', data);
    });

    // Send the new terminal size to the backend process
    this.terminal.onResize((size) => {
      console.log("Resizing term");
      this.socket.emit('resize', size.cols, size.rows);
    });
  }

  /**
   * @todo subscribe to windows size changes and recall this
   * @see https://github.com/xtermjs/xterm.js/issues/1359#issuecomment-725099398
   */
  calculateTerminalSize() {
    let height = this.container.nativeElement.offsetHeight / 18;
    let width = this.container.nativeElement.offsetWidth / 9;
    this.terminalRows = parseInt(height.toString(), 10); // height/8;
    this.terminalCols = parseInt(width.toString(), 10);  // width/8;
  }

  connectTerminal() {
    console.log('should reconnect');

    this.socket.connect();
  }
}

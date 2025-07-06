import { Component, ElementRef, OnInit, OnDestroy, ViewChild, HostListener } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { io } from 'socket.io-client';

@Component({
    selector: 'app-root',
    imports: [RouterOutlet],
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  @ViewChild('terminal', { static: true })
  container: ElementRef<HTMLDivElement>;

  terminal: Terminal = new Terminal({
    cursorBlink: true,
    fontSize: 16,
    theme: {
      selectionForeground: "#ffffff",
    },
  });

  fitAddon: FitAddon = new FitAddon();
  socket: any;
  terminalCols: number;
  terminalRows: number;

  ngOnInit(): void {
    this.socket = io('http://localhost:3000');

    this.terminal.loadAddon(this.fitAddon);
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

  ngOnDestroy(): void {
    // Dispose of the FitAddon
    this.fitAddon.dispose();

    // Disconnect the socket
    if (this.socket) {
      this.socket.disconnect();
    }

    // Dispose of the terminal
    this.terminal.dispose();
  }

  /**
   * Calculate terminal size and fit it to the container
   */
  calculateTerminalSize() {
    // Use the FitAddon to automatically calculate the best size
    this.fitAddon.fit();

    // Update the terminal dimensions
    this.terminalCols = this.terminal.cols;
    this.terminalRows = this.terminal.rows;

    // Emit the resize event to the server
    this.socket?.emit('resize', this.terminalCols, this.terminalRows);
  }

  /**
   * Listen for window resize events and recalculate terminal size
   */
  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    this.calculateTerminalSize();
  }

  connectTerminal() {
    console.log('should reconnect');

    this.socket.connect();
  }
}

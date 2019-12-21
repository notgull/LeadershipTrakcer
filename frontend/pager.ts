/*
 * frontend/pager.ts
 * LeadershipTrakcer - Martial arts attendance logger
 *
 * Copyright (c) 2019, John Nunley and Larson Rivera
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice, this
 *    list of conditions and the following disclaimer.
 *
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 *    this list of conditions and the following disclaimer in the documentation
 *    and/or other materials provided with the distribution.
 *
 * 3. Neither the name of the copyright holder nor the names of its
 *    contributors may be used to endorse or promote products derived from
 *    this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
 * OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

// page switcher widget
import * as $ from "jquery";

import { getParameter } from "./parameter";

export type PageSwitcher = (page: number) => void;

export class Pager {
  public frame: JQuery;

  constructor(
    private totalPages: number
  ) {
    this.frame = $("<form>");
    this.renderWidget();
  }

  renderWidget() {
    const row = $("<tr>")
      .appendTo($("<table>").appendTo(this.frame));

    const that = this;
    for (let i = 0; i < this.totalPages; i++) {
      row.append($(`<a href="/?eventpage=${i}" style="margin: 1px; padding: 1px; border: 1px solid black">${i+1}</a>`));
    }
  }
}

export function setupPager() {
  const diagramPager = $("#diagram-pager");
  if (diagramPager.length) {
    const pager = new Pager(
      Math.floor(parseInt(diagramPager.attr("class"), 10)),
    );

    diagramPager.append(pager.frame);
  }
}

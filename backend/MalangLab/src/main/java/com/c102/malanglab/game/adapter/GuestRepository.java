package com.c102.malanglab.game.adapter;

import com.c102.malanglab.game.domain.Guest;
import org.springframework.data.jpa.repository.JpaRepository;

public interface GuestRepository extends JpaRepository<Guest, String> {
}
